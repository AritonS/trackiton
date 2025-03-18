import React from 'react';
import StockDashboard from './components/StockDashboard';
import styled from 'styled-components';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #f5f5f5;
`;

const Header = styled.header`
  background-color: #ffffff;
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  margin: 0;
  color: #333;
  font-size: 1.8rem;
`;

function App() {
  return (
    <AppContainer>
      <Header>
        <Title>TrackItOn - Real-Time Stock Tracker</Title>
      </Header>
      <StockDashboard />
    </AppContainer>
  );
}

export default App;
