import { StockData } from '../types/stock';

const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';
const STORAGE_KEY = 'stockData';
const TIMESTAMP_KEY = 'lastFetchTimestamp';

if (!API_KEY) {
  console.error('Alpha Vantage API key is not set. Please set REACT_APP_ALPHA_VANTAGE_API_KEY in your .env file');
} else {
  console.log('API key is configured');
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRateLimited = (data: any): boolean => {
  return data['Information']?.includes('API call frequency') || 
         data['Note']?.includes('API call frequency') ||
         data['Information']?.includes('premium') ||
         data['Note']?.includes('premium');
};

const getStoredData = (): StockData[] | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  return JSON.parse(data);
};

const setStoredData = (data: StockData[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

const getLastFetchTime = (): Date | null => {
  const timestamp = localStorage.getItem(TIMESTAMP_KEY);
  return timestamp ? new Date(parseInt(timestamp)) : null;
};

const setLastFetchTime = (): void => {
  localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
};

const shouldFetchNewData = (): boolean => {
  const lastFetch = getLastFetchTime();
  if (!lastFetch) return true;

  const now = new Date();
  const lastFetchHour = lastFetch.getUTCHours();
  const currentHour = now.getUTCHours();

  // If we haven't fetched today, we should fetch
  if (lastFetch.getUTCDate() !== now.getUTCDate()) {
    return true;
  }

  // Check if we need to fetch based on the two daily fetch times (6 AM and 8 PM EST)
  // 6 AM EST = 11:00 UTC
  // 8 PM EST = 1:00 UTC next day
  if (currentHour >= 11 && lastFetchHour < 11) {
    return true;
  }
  if (currentHour >= 1 && lastFetchHour < 1) {
    return true;
  }

  return false;
};

const fetchWithRetry = async (url: string, retries = 3, backoff = 2000): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (isRateLimited(data)) {
        console.log(`Rate limit hit, attempt ${i + 1} of ${retries}`);
        if (i === retries - 1) {
          throw new Error('API rate limit reached. Please try again in a few minutes or upgrade to a premium API key.');
        }
        const waitTime = backoff * Math.pow(2, i);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await delay(waitTime);
        continue;
      }
      
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      const waitTime = backoff * Math.pow(2, i);
      await delay(waitTime);
    }
  }
  throw new Error('Failed to fetch data after retries');
};

const fetchCompanyOverview = async (symbol: string): Promise<string> => {
  try {
    const data = await fetchWithRetry(
      `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${API_KEY}`
    );
    return data.Name || symbol;
  } catch (error) {
    console.error(`Error fetching company overview for ${symbol}:`, error);
    return symbol;
  }
};

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    console.log(`Fetching data for ${symbol}...`);
    // Fetch current price and intraday data in one call
    const data = await fetchWithRetry(
      `${BASE_URL}?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=5min&apikey=${API_KEY}`
    );

    if (!data['Time Series (5min)']) {
      throw new Error(`No data available for ${symbol}`);
    }

    const timeSeriesData = data['Time Series (5min)'];
    const dataPoints = Object.entries(timeSeriesData)
      .map(([timestamp, values]: [string, any]) => ({
        timestamp,
        price: parseFloat(values['4. close'])
      }))
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    // Get the latest price and calculate change
    const latestPrice = dataPoints[dataPoints.length - 1].price;
    const previousPrice = dataPoints[0].price;
    const change = latestPrice - previousPrice;
    const changePercent = (change / previousPrice) * 100;

    // Get company name from the same API call
    const companyName = data['Meta Data']?.['2. Symbol'] || symbol;

    return {
      symbol,
      name: companyName,
      price: latestPrice,
      change,
      changePercent,
      data: dataPoints
    };
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    throw error;
  }
};

export const fetchMultipleStocks = async (symbols: string[]): Promise<StockData[]> => {
  try {
    // Check if we need to fetch new data
    if (!shouldFetchNewData()) {
      console.log('Using stored data');
      const storedData = getStoredData();
      if (storedData) {
        return storedData;
      }
    }

    console.log('Starting to fetch multiple stocks:', symbols);
    const results: StockData[] = [];
    
    // Fetch stocks sequentially with increased delay between requests
    for (const symbol of symbols) {
      try {
        console.log(`Processing ${symbol}...`);
        const data = await fetchStockData(symbol);
        results.push(data);
        console.log(`Successfully fetched data for ${symbol}`);
      } catch (error) {
        console.error(`Failed to fetch ${symbol}:`, error);
        // Continue with other symbols even if one fails
        continue;
      }
      // Add longer delay between requests (5 seconds)
      await delay(5000);
    }

    // Store the results
    setStoredData(results);
    setLastFetchTime();

    console.log('Finished fetching all stocks:', results);
    return results;
  } catch (error) {
    console.error('Error fetching multiple stocks:', error);
    throw error;
  }
}; 