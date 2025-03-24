export type TimeRange = '24h' | '1w' | '1m' | '1y';

export interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  data: {
    timestamp: string;
    price: number;
  }[];
}

export interface Stock {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
}

export interface StockChartData {
  labels: string[];
  prices: number[];
  volumes: number[];
} 