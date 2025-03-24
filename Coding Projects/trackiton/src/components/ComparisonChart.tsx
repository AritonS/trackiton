import React from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import { ChartData } from 'chart.js';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const ChartContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
  width: 100%;
  max-width: 1200px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, #3498db, #2ecc71);
  }
`;

const ChartTitle = styled.h2`
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.8rem;
`;

const StockLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
  justify-content: center;
`;

const LegendItem = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  background-color: ${props => props.$color}10;
  border: 1px solid ${props => props.$color}30;

  &:hover {
    background-color: ${props => props.$color}20;
    transform: translateY(-1px);
  }
`;

const ColorDot = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  border: 2px solid ${props => props.$color}80;
`;

const LegendHint = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 10px;
  font-style: italic;
`;

interface ComparisonChartProps {
  data: ChartData<'line'>;
  selectedStocks: string[];
  onToggleStock: (symbol: string) => void;
}

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

const ComparisonChart: React.FC<ComparisonChartProps> = ({
  data,
  selectedStocks,
  onToggleStock
}) => {
  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        titleColor: '#2c3e50',
        bodyColor: '#2c3e50',
        borderColor: '#e0e0e0',
        borderWidth: 1,
        padding: 10,
        boxPadding: 5,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          callback: function(value) {
            return '$' + value;
          }
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <ChartContainer>
      <ChartTitle>Stock Price Comparison</ChartTitle>
      <LegendHint>Click on a stock name to show/hide it from the chart</LegendHint>
      <StockLegend>
        {data.datasets.map((dataset, index) => (
          <LegendItem
            key={dataset.label}
            $color={COLORS[index % COLORS.length]}
            onClick={() => onToggleStock(dataset.label as string)}
            style={{
              opacity: selectedStocks.includes(dataset.label as string) ? 1 : 0.5,
              textDecoration: selectedStocks.includes(dataset.label as string) ? 'none' : 'line-through'
            }}
          >
            <ColorDot $color={COLORS[index % COLORS.length]} />
            {dataset.label}
          </LegendItem>
        ))}
      </StockLegend>
      <div style={{ height: '400px' }}>
        <Line options={options} data={data} />
      </div>
    </ChartContainer>
  );
};

export default ComparisonChart; 