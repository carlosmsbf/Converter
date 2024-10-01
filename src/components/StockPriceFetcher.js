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
        'BOVESPA', 'ABEV3', 'AZUL4', 'B3SA3', 'BHIA3', 'BBAS3', 'BBDC4', 'BPAC11',
        'BRAP4', 'BRFS3', 'CBAV3', 'CCRO3', 'CSAN3', 'EMBR3', 'GGBR4', 'ITRI11',
        'ITSA4', 'ITUB4', 'JBSS3', 'KNCA11', 'KNHF11', 'KNHY11', 'AMER3', 'LREN3',
        'MGLU3', 'PETR4', 'USIM5', 'VALE3', 'VGIR11', 'XPBR31'
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
        <TableHead>
          <TableRow>
            <TableCell>Symbol</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Change (%)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stockData.map((stock) => (
            <TableRow key={stock.symbol}>
              <TableCell>{stock.symbol}</TableCell>
              <TableCell>{stock.currentPrice}</TableCell>
              <TableCell>{stock.change}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default StockTable;
