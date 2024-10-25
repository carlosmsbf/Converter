import React, { useEffect, useState } from 'react';
import { ref, get } from 'firebase/database'; 
import { database } from '../firebaseConfig'; 
import { Table, TableBody, TableCell, TableContainer, TableRow, Paper, CircularProgress, Typography } from '@mui/material';

const StockTable = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      const stockSymbols = ['ABEV3', 'AZUL4' /*, Add more symbols here*/];
      const stockPromises = stockSymbols.map(async (symbol) => {
        const dbRef = ref(database, `stocks/${symbol}/latest`);
        try {
          const snapshot = await get(dbRef);
          if (snapshot.exists()) {
            return { symbol, ...snapshot.val() };
          } else {
            return { symbol, error: 'No data available' };
          }
        } catch (err) {
          return { symbol, error: err.message };
        }
      });

      try {
        const data = await Promise.all(stockPromises);
        setStockData(data); 
      } catch (err) {
        setError(err.message); 
      } finally {
        setLoading(false);
      }
    };

    fetchStockData();
  }, []);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <TableContainer component={Paper}>
      <Typography variant="h6" align="center" gutterBottom>
        Latest Stock Prices
      </Typography>
      <Table>
        <TableBody>
          {/* Symbol Row */}
          <TableRow>
            <TableCell variant="head">Symbol</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>{stock.symbol}</TableCell>
            ))}
          </TableRow>
          {/* Price Row */}
          <TableRow>
            <TableCell variant="head">Price</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>
                {stock.currentPrice ? stock.currentPrice : '-'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Max</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>
                {stock.max ? stock.max : '-'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Min</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>
                {stock.min ? stock.min : '-'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Previous Close Price</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>
                {stock.previousClose ? stock.previousClose : '-'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Volume</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>
                {stock.volume ? stock.volume : '-'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Max 52 weeks</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>
                {stock.fiftyTwoWeekHigh ? stock.fiftyTwoWeekHigh : '-'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Min 52 weeks</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>
                {stock.fiftyTwoWeekLow ? stock.fiftyTwoWeekLow : '-'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Change (%)</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>
                {stock.change ? stock.change : '-'}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Dividends</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>
                {stock.lastDividendValue ? stock.lastDividendValue : '-'}
              </TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StockTable;
