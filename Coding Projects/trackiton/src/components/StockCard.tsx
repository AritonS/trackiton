import React from 'react';
import styled from 'styled-components';
import { ChartData } from 'chart.js';
import StockChart from './StockChart';

const Card = styled.div`
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  border-radius: 16px;
  padding: 20px;
  margin: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 500px;
  position: relative;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-2px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
`;

const StockInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const Symbol = styled.h2`
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 700;
`;

const CompanyName = styled.div`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-top: 2px;
`;

const PriceContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
`;

const Price = styled.div<{ $isPositive: boolean }>`
  font-size: 1.6rem;
  font-weight: bold;
  color: ${props => props.$isPositive ? '#2ecc71' : '#e74c3c'};
  margin-bottom: 2px;
`;

const Change = styled.div<{ $isPositive: boolean }>`
  color: ${props => props.$isPositive ? '#2ecc71' : '#e74c3c'};
  font-size: 0.9rem;
  font-weight: 500;
`;

const RemoveButton = styled.button<{ $isDefault: boolean }>`
  background: ${props => props.$isDefault ? '#95a5a6' : '#e74c3c'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: ${props => props.$isDefault ? 'not-allowed' : 'pointer'};
  transition: all 0.2s ease-in-out;
  opacity: ${props => props.$isDefault ? 0.7 : 1};
  font-weight: 500;

  &:hover {
    background: ${props => props.$isDefault ? '#95a5a6' : '#c0392b'};
    transform: translateY(-1px);
  }
`;

const DefaultBadge = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: #3498db;
  color: white;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

interface StockCardProps {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  chartData: ChartData<'line'>;
  onRemove: (symbol: string) => void;
  isDefault: boolean;
}

const StockCard: React.FC<StockCardProps> = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  chartData,
  onRemove,
  isDefault
}) => {
  const isPositive = change >= 0;

  return (
    <Card>
      {isDefault && <DefaultBadge>Default Stock</DefaultBadge>}
      <Header>
        <StockInfo>
          <Symbol>{symbol}</Symbol>
          <CompanyName>{name}</CompanyName>
        </StockInfo>
        <PriceContainer>
          <Price $isPositive={isPositive}>
            ${price.toFixed(2)}
          </Price>
          <Change $isPositive={isPositive}>
            {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
          </Change>
        </PriceContainer>
      </Header>
      <StockChart data={chartData} />
    </Card>
  );
};

export default StockCard; 