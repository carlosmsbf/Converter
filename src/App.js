import React from 'react';
import CurrencyConverter from './components/CurrencyConverter';
import { CssBaseline } from '@mui/material';
import StockPriceFetcher from './components/StockPriceFetcher';
import { Container } from '@mui/material';

function App() {
  return (
    <>
      <CssBaseline />
      <CurrencyConverter />

      <Container>
      <h1>Stock Price and Currency App</h1>
      <StockPriceFetcher />
      {/* You can place CurrencyConverter or other components here */}
    </Container>
      
    </>
  );
}

export default App;
