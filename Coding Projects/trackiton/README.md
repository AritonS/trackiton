# TrackItOn - Real-Time Stock Tracker

A modern web application for tracking real-time stock data with interactive visualizations.

## Features

- Real-time stock data for 5 different industries
- Interactive line charts with multiple time ranges (24h, 1w, 1m, 1y)
- Auto-refreshing data every 5 minutes
- Modern, responsive UI
- Default stocks from different industries:
  - Technology: AAPL (Apple Inc.)
  - Finance: JPM (JPMorgan Chase)
  - Healthcare: JNJ (Johnson & Johnson)
  - Retail: WMT (Walmart)
  - Energy: XOM (Exxon Mobil)

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Alpha Vantage API key

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/trackiton.git
cd trackiton
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Alpha Vantage API key:
```
REACT_APP_ALPHA_VANTAGE_API_KEY=your_api_key_here
```

You can get a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key).

4. Start the development server:
```bash
npm start
# or
yarn start
```

The application will be available at `http://localhost:3000`.

## Usage

1. Enter a stock symbol (e.g., AAPL, GOOGL, MSFT) in the input field
2. Click "Add Stock" to add it to your watchlist
3. View real-time price updates and interactive charts
4. Use the time range buttons to view different timeframes
5. Click "Remove" to remove a stock from your watchlist

## Technologies Used

- React
- TypeScript
- Chart.js
- Styled Components
- Alpha Vantage API

## License

MIT
