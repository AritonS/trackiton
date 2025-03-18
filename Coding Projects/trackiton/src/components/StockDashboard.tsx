import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchStockData } from '../services/stockService';
import { StockData } from '../types/stock';
import StockCard from './StockCard';

const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  width: 100%;
`;

const DashboardTitle = styled.h1`
  margin: 0;
  color: #333;
`;

const StockInfo = styled.div`
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 20px;
`;

const DEFAULT_STOCKS = [
  'AAPL',  // Technology
  'JPM',   // Financial Services
  'JNJ',   // Healthcare
  'WMT',   // Retail
  'XOM'    // Energy
];

const ROTATION_INTERVAL = 30000; // 30 seconds

const ErrorMessage = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  border: 1px solid #ffeeba;
`;

const StockDashboard: React.FC = () => {
  const [currentStockIndex, setCurrentStockIndex] = useState(0);
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentStock = async () => {
    try {
      setLoading(true);
      setError(null);
      const symbol = DEFAULT_STOCKS[currentStockIndex];
      console.log(`Fetching data for ${symbol}...`);
      const data = await fetchStockData(symbol);
      setStockData(data);
    } catch (err) {
      console.error('Error fetching stock data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error fetching stock data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Effect for rotating stocks
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStockIndex((prevIndex) => (prevIndex + 1) % DEFAULT_STOCKS.length);
    }, ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Effect for fetching data when stock changes
  useEffect(() => {
    fetchCurrentStock();
  }, [currentStockIndex]);

  const getChartData = (data: StockData) => {
    return {
      labels: data.data.map(d => new Date(d.timestamp).toLocaleTimeString()),
      datasets: [
        {
          label: data.symbol,
          data: data.data.map(d => d.price),
          borderColor: '#007bff',
          tension: 0.1,
        },
      ],
    };
  };

  if (loading) return <DashboardContainer>Loading stock data...</DashboardContainer>;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!stockData) return <DashboardContainer>No data available</DashboardContainer>;

  return (
    <DashboardContainer>
      <Header>
        <DashboardTitle>Stock Tracker</DashboardTitle>
      </Header>
      <StockInfo>
        Showing {currentStockIndex + 1} of {DEFAULT_STOCKS.length} stocks. 
        Rotating every 30 seconds.
      </StockInfo>
      <StockCard
        symbol={stockData.symbol}
        price={stockData.price}
        change={stockData.change}
        changePercent={stockData.changePercent}
        chartData={getChartData(stockData)}
        onRemove={() => {}} // Disabled for this version
        isDefault={true}
      />
    </DashboardContainer>
  );
};

export default StockDashboard; 