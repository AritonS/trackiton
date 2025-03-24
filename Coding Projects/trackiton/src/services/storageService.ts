import { StockData } from '../types/stock';

const STORAGE_KEY = 'stockData';
const TIMESTAMP_KEY = 'lastFetchTimestamp';

interface StoredData {
  stocks: StockData[];
  timestamp: number;
}

// Convert EST times to UTC for comparison
const FETCH_TIMES = {
  MORNING: { hour: 11, minute: 0 }, // 6AM EST = 11:00 UTC
  EVENING: { hour: 1, minute: 0 }   // 8PM EST = 1:00 UTC next day
};

export const saveStockData = (stocks: StockData[]): void => {
  const data: StoredData = {
    stocks,
    timestamp: Date.now()
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const getStoredStockData = (): StockData[] | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  
  try {
    const parsedData: StoredData = JSON.parse(data);
    return parsedData.stocks;
  } catch (error) {
    console.error('Error parsing stored stock data:', error);
    return null;
  }
};

export const shouldFetchNewData = (): boolean => {
  const lastFetch = getLastFetchTime();
  if (!lastFetch) return true;

  const now = new Date();
  const lastFetchHour = lastFetch.getUTCHours();
  const currentHour = now.getUTCHours();

  // If we haven't fetched today, we should fetch
  if (lastFetch.getUTCDate() !== now.getUTCDate()) {
    return true;
  }

  // Check if we need to fetch based on the two daily fetch times
  if (currentHour >= FETCH_TIMES.MORNING.hour && lastFetchHour < FETCH_TIMES.MORNING.hour) {
    return true;
  }
  if (currentHour >= FETCH_TIMES.EVENING.hour && lastFetchHour < FETCH_TIMES.EVENING.hour) {
    return true;
  }

  return false;
};

export const getLastFetchTime = (): Date | null => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  
  try {
    const parsedData: StoredData = JSON.parse(data);
    return new Date(parsedData.timestamp);
  } catch (error) {
    console.error('Error parsing last fetch time:', error);
    return null;
  }
};

export const updateLastFetchTimestamp = (): void => {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) return;
  
  try {
    const parsedData: StoredData = JSON.parse(data);
    parsedData.timestamp = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsedData));
  } catch (error) {
    console.error('Error updating last fetch timestamp:', error);
  }
};

export const getNextFetchTime = (): Date => {
  const lastFetch = getLastFetchTime();
  if (!lastFetch) return new Date();

  const now = new Date();
  const nextFetch = new Date(lastFetch);

  // If we're before the morning fetch time, set to morning fetch time
  if (now.getUTCHours() < FETCH_TIMES.MORNING.hour) {
    nextFetch.setUTCHours(FETCH_TIMES.MORNING.hour, FETCH_TIMES.MORNING.minute, 0, 0);
  }
  // If we're between morning and evening fetch times, set to evening fetch time
  else if (now.getUTCHours() < FETCH_TIMES.EVENING.hour) {
    nextFetch.setUTCHours(FETCH_TIMES.EVENING.hour, FETCH_TIMES.EVENING.minute, 0, 0);
  }
  // If we're after evening fetch time, set to next day's morning fetch time
  else {
    nextFetch.setUTCDate(nextFetch.getUTCDate() + 1);
    nextFetch.setUTCHours(FETCH_TIMES.MORNING.hour, FETCH_TIMES.MORNING.minute, 0, 0);
  }

  return nextFetch;
}; 