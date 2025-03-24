import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { fetchMultipleStocks } from '../services/stockService';
import { 
  saveStockData, 
  getStoredStockData, 
  shouldFetchNewData, 
  updateLastFetchTimestamp, 
  getLastFetchTime,
  getNextFetchTime 
} from '../services/storageService';
import { StockData } from '../types/stock';
import StockCard from './StockCard';
import ComparisonChart from './ComparisonChart';

const DashboardContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
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
  text-align: center;
`;

const CardsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 20px;
  width: 100%;
`;

const UpdateInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const LastUpdate = styled.div`
  text-align: center;
`;

const NextUpdate = styled.div`
  text-align: center;
  color: #3498db;
  font-weight: 500;
`;

const FetchSchedule = styled.div`
  text-align: center;
  font-style: italic;
  color: #95a5a6;
  font-size: 0.85rem;
`;

const Section = styled.div`
  width: 100%;
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  margin: 0 0 20px 0;
  font-size: 1.8rem;
  text-align: center;
`;

const DEFAULT_STOCKS = [
  'AAPL',  // Technology
  'JPM',   // Financial Services
  'JNJ',   // Healthcare
  'WMT',   // Retail
  'XOM'    // Energy
];

const ErrorMessage = styled.div`
  background-color: #fff3cd;
  color: #856404;
  padding: 15px;
  border-radius: 4px;
  margin: 20px 0;
  border: 1px solid #ffeeba;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #666;
  font-size: 1.2rem;
  line-height: 1.5;
`;

const LoadingSubMessage = styled.div`
  margin-top: 10px;
  color: #999;
  font-size: 0.9rem;
`;

const StockDashboard: React.FC = () => {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [selectedStocks, setSelectedStocks] = useState<string[]>(DEFAULT_STOCKS);

  const fetchAllStocks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await fetchMultipleStocks(DEFAULT_STOCKS);
      setStockData(data);
      saveStockData(data);
      updateLastFetchTimestamp();
      setLastUpdate(new Date());
    } catch (err) {
      console.error('Error fetching stock data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Error fetching stock data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Effect for initial data load
  useEffect(() => {
    const loadData = async () => {
      const storedData = getStoredStockData();
      const lastFetchTime = getLastFetchTime();
      
      if (storedData && lastFetchTime) {
        setStockData(storedData);
        setLastUpdate(lastFetchTime);
        setLoading(false);
        
        if (shouldFetchNewData()) {
          await fetchAllStocks();
        }
      } else {
        await fetchAllStocks();
      }
    };

    loadData();
  }, []);

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

  const getComparisonChartData = () => {
    if (!stockData.length) return null;

    const labels = stockData[0].data.map(d => new Date(d.timestamp).toLocaleTimeString());
    
    return {
      labels,
      datasets: stockData
        .filter(stock => selectedStocks.includes(stock.symbol))
        .map((stock, index) => ({
          label: stock.symbol,
          data: stock.data.map(d => d.price),
          borderColor: COLORS[index % COLORS.length],
          backgroundColor: `${COLORS[index % COLORS.length]}15`,
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointRadius: 0,
          pointHoverRadius: 4,
          pointHoverBackgroundColor: COLORS[index % COLORS.length],
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2,
        }))
    };
  };

  const handleToggleStock = (symbol: string) => {
    setSelectedStocks(prev => {
      if (prev.includes(symbol)) {
        return prev.filter(s => s !== symbol);
      }
      return [...prev, symbol];
    });
  };

  if (loading) {
    return (
      <DashboardContainer>
        <LoadingMessage>
          Loading stock data...
          <LoadingSubMessage>
            Please allow up to 30 seconds for all stocks to load.
            <br />
            We're fetching data for 5 stocks with proper delays to respect API limits.
          </LoadingSubMessage>
        </LoadingMessage>
      </DashboardContainer>
    );
  }

  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!stockData.length) return <DashboardContainer>No data available</DashboardContainer>;

  const comparisonData = getComparisonChartData();

  return (
    <DashboardContainer>
      <Header>
        <DashboardTitle>Stock Tracker</DashboardTitle>
      </Header>
      <StockInfo>
        Showing {DEFAULT_STOCKS.length} stocks from different industries
      </StockInfo>

      <Section>
        <SectionTitle>Stock Comparison</SectionTitle>
        {comparisonData && (
          <ComparisonChart
            data={comparisonData}
            selectedStocks={selectedStocks}
            onToggleStock={handleToggleStock}
          />
        )}
      </Section>

      <Section>
        <SectionTitle>Individual Stocks</SectionTitle>
        <CardsGrid>
          {stockData.map((stock) => (
            <StockCard
              key={stock.symbol}
              symbol={stock.symbol}
              name={stock.name}
              price={stock.price}
              change={stock.change}
              changePercent={stock.changePercent}
              chartData={getChartData(stock)}
              onRemove={() => {}} // Disabled for this version
              isDefault={true}
            />
          ))}
        </CardsGrid>
      </Section>

      <UpdateInfo>
        {lastUpdate && (
          <LastUpdate>
            Last updated: {lastUpdate.toLocaleString()}
          </LastUpdate>
        )}
        <NextUpdate>
          Next update: {getNextFetchTime().toLocaleString()}
        </NextUpdate>
        <FetchSchedule>
          Data is updated at 6:00 AM and 8:00 PM EST
        </FetchSchedule>
      </UpdateInfo>
    </DashboardContainer>
  );
};

const COLORS = [
  '#3498db', // Blue
  '#2ecc71', // Green
  '#e74c3c', // Red
  '#f1c40f', // Yellow
  '#9b59b6', // Purple
  '#1abc9c', // Turquoise
  '#e67e22', // Orange
  '#34495e', // Dark Blue
  '#7f8c8d', // Gray
  '#c0392b'  // Dark Red
];

export default StockDashboard; 