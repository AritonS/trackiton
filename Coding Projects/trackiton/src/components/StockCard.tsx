import React from 'react';
import styled from 'styled-components';
import { ChartData } from 'chart.js';
import StockChart from './StockChart';

const Card = styled.div`
  background: white;
  border-radius: 10px;
  padding: 20px;
  margin: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 800px;
  position: relative;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Symbol = styled.h2`
  margin: 0;
  color: #333;
`;

const Price = styled.div<{ $isPositive: boolean }>`
  font-size: 1.5rem;
  font-weight: bold;
  color: ${props => props.$isPositive ? '#28a745' : '#dc3545'};
`;

const Change = styled.div<{ $isPositive: boolean }>`
  color: ${props => props.$isPositive ? '#28a745' : '#dc3545'};
  font-size: 1rem;
`;

const RemoveButton = styled.button<{ $isDefault: boolean }>`
  background: ${props => props.$isDefault ? '#6c757d' : '#dc3545'};
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: ${props => props.$isDefault ? 'not-allowed' : 'pointer'};
  transition: background 0.2s;
  opacity: ${props => props.$isDefault ? 0.7 : 1};

  &:hover {
    background: ${props => props.$isDefault ? '#6c757d' : '#c82333'};
  }
`;

const DefaultBadge = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  background: #6c757d;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
`;

interface StockCardProps {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  chartData: ChartData<'line'>;
  onRemove: (symbol: string) => void;
  isDefault: boolean;
}

const StockCard: React.FC<StockCardProps> = ({
  symbol,
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
        <Symbol>{symbol}</Symbol>
        <RemoveButton 
          $isDefault={isDefault}
          onClick={() => onRemove(symbol)}
          disabled={isDefault}
        >
          Remove
        </RemoveButton>
      </Header>
      <Price $isPositive={isPositive}>
        ${price.toFixed(2)}
      </Price>
      <Change $isPositive={isPositive}>
        {change >= 0 ? '+' : ''}{change.toFixed(2)} ({changePercent.toFixed(2)}%)
      </Change>
      <StockChart data={chartData} />
    </Card>
  );
};

export default StockCard; 