import React from 'react';
import CurrencyConverter from './components/CurrencyConverter';
import { CssBaseline } from '@mui/material';
import StockPriceFetcher from './components/StockPriceFetcher';
import { Container } from '@mui/material';
import StockComponent from './components/StockComponent';


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
    <div className="App">
      <h1>Firebase Stock App</h1>
      <StockComponent />
    </div>
      
    </>
  );
}

export default App;
