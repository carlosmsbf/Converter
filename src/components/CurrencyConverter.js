import React, { useState } from 'react';
import { ExchangeRateFactory } from '../factories/currency/ExchangeRateFactory';
import { Box, TextField, MenuItem, Button, Typography, Container, CircularProgress } from '@mui/material';
import CountryFlag from 'react-country-flag';

const currencyFlags = {
  USD: 'US', // United States
  EUR: 'EU', // European Union
  GBP: 'GB', // United Kingdom
  JPY: 'JP', // Japan
  BRL: 'BR', // Brazil
  CAD: 'CA', // Canada
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [currencies] = useState(['USD', 'EUR', 'GBP', 'JPY', 'BRL', 'CAD']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [convertedAmount, setConvertedAmount] = useState(null);

  const provider = ExchangeRateFactory.createProvider('api');

  const handleAmountChange = (e) => setAmount(e.target.value);
  const handleFromCurrencyChange = (e) => setFromCurrency(e.target.value);
  const handleToCurrencyChange = (e) => setToCurrency(e.target.value);

  // Swap function for switching currencies
  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  // Fetch and convert currencies on button press
  const handleConvert = async () => {
    setLoading(true);
    setConvertedAmount(null);
    setError(null);

    try {
      const rate = await provider.getExchangeRate(fromCurrency, toCurrency);
      // Directly calculate the converted amount without storing exchangeRate
      setConvertedAmount((amount * rate).toFixed(2));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Currency Converter
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          boxShadow: 3,
          padding: 3,
          borderRadius: 2,
          backgroundColor: '#fff',
        }}
      >
        <TextField
          type="number"
          label="Amount"
          value={amount}
          onChange={handleAmountChange}
          fullWidth
          variant="outlined"
          InputProps={{ inputProps: { min: 0 } }}
        />

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            select
            label="From"
            value={fromCurrency}
            onChange={handleFromCurrencyChange}
            fullWidth
            variant="outlined"
          >
            {currencies.map((currency) => (
              <MenuItem key={currency} value={currency}>
                <CountryFlag
                  countryCode={currencyFlags[currency]}
                  svg
                  style={{ marginRight: '8px', width: '24px', height: '24px' }}
                />
                {currency}
              </MenuItem>
            ))}
          </TextField>

          <Button variant="outlined" onClick={handleSwap}>
            ⇄ Swap
          </Button>

          <TextField
            select
            label="To"
            value={toCurrency}
            onChange={handleToCurrencyChange}
            fullWidth
            variant="outlined"
          >
            {currencies.map((currency) => (
              <MenuItem key={currency} value={currency}>
                <CountryFlag
                  countryCode={currencyFlags[currency]}
                  svg
                  style={{ marginRight: '8px', width: '24px', height: '24px' }}
                />
                {currency}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Convert Button */}
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleConvert}
          sx={{ mt: 2 }}
        >
          Convert
        </Button>

        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">Error: {error}</Typography>
        ) : (
          convertedAmount && (
            <Typography variant="h5" align="center">
              {amount} {fromCurrency} = {convertedAmount} {toCurrency}
            </Typography>
          )
        )}
      </Box>
    </Container>
  );
};

export default CurrencyConverter;
