import { StockData } from '../types/stock';

const API_KEY = process.env.REACT_APP_ALPHA_VANTAGE_API_KEY;
const BASE_URL = 'https://www.alphavantage.co/query';

if (!API_KEY) {
  console.error('Alpha Vantage API key is not set. Please set REACT_APP_ALPHA_VANTAGE_API_KEY in your .env file');
} else {
  console.log('API key is configured');
}

// Cache for storing stock data
const cache = new Map<string, { data: StockData; timestamp: number }>();
const CACHE_DURATION = 30000; // 30 seconds in milliseconds

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const isRateLimited = (data: any): boolean => {
  return data['Information']?.includes('API call frequency') || 
         data['Note']?.includes('API call frequency') ||
         data['Information']?.includes('premium') ||
         data['Note']?.includes('premium');
};

const getCachedData = (symbol: string): StockData | null => {
  const cached = cache.get(symbol);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (symbol: string, data: StockData) => {
  cache.set(symbol, { data, timestamp: Date.now() });
};

const fetchWithRetry = async (url: string, retries = 3, backoff = 1000): Promise<any> => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      const data = await response.json();
      
      if (isRateLimited(data)) {
        if (i === retries - 1) {
          throw new Error('API rate limit reached. Please try again in a few minutes or upgrade to a premium API key.');
        }
        await delay(backoff * Math.pow(2, i)); // Exponential backoff
        continue;
      }
      
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await delay(backoff * Math.pow(2, i));
    }
  }
  throw new Error('Failed to fetch data after retries');
};

export const fetchStockData = async (symbol: string): Promise<StockData> => {
  try {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    // Check cache first
    const cachedData = getCachedData(symbol);
    if (cachedData) {
      console.log(`Using cached data for ${symbol}`);
      return cachedData;
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

    const stockData = {
      symbol,
      price: latestPrice,
      change,
      changePercent,
      data: dataPoints
    };

    // Cache the result
    setCachedData(symbol, stockData);
    return stockData;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error);
    throw error;
  }
};

export const fetchMultipleStocks = async (symbols: string[]): Promise<StockData[]> => {
  try {
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
      // Add longer delay between requests
      await delay(2000);
    }

    console.log('Finished fetching all stocks:', results);
    return results;
  } catch (error) {
    console.error('Error fetching multiple stocks:', error);
    throw error;
  }
}; 