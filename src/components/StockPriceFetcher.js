import React, { useEffect, useState } from 'react';
import { StockPriceFactory } from '../factories/stock/StockPriceFactory';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, Typography } from '@mui/material';

const StockTable = () => {
  const [stockData, setStockData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStockData = async () => {
      const provider = StockPriceFactory.createProvider('brapi');
      const stockSymbols = [
        'ABEV3', 'AZUL4' /*, 'B3SA3', 'BHIA3', 'BBAS3', 'BBDC4', 'BPAC11',
        'BRAP4', 'BRFS3', 'CBAV3', 'CCRO3', 'CSAN3', 'EMBR3', 'GGBR4', 'ITRI11',
        'ITSA4', 'ITUB4', 'JBSS3', 'KNCA11', 'KNHF11', 'KNHY11', 'AMER3', 'LREN3',
        'MGLU3', 'PETR4', 'USIM5', 'VALE3', 'VGIR11', 'XPBR31'*/
      ];

      try {
        const data = await provider.getStockPrices(stockSymbols);
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
        Stock Prices
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
              <TableCell key={stock.symbol}>{stock.currentPrice}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Max</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>{stock.max}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Min</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>{stock.min}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Previous Close Price</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>{stock.previousClose}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Volume</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>{stock.volume}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Max 52 weeks</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>{stock.fiftyTwoWeekHigh}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Min 52 weeks</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>{stock.fiftyTwoWeekLow}</TableCell>
            ))}
          </TableRow>
          
          <TableRow>
            <TableCell variant="head">Change (%)</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>{stock.change}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell variant="head">Dividends</TableCell>
            {stockData.map((stock) => (
              <TableCell key={stock.symbol}>{stock.dividendsRate}</TableCell>
            ))}
                    </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StockTable;
