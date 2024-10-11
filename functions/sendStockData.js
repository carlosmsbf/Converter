// netlify/functions/sendStockData.js
const { StockPriceFactory } = require('../factories/stock/StockPriceFactory');
const { sendStockData } = require('./sendStockData');

exports.handler = async (event, context) => {
  const provider = StockPriceFactory.createProvider('brapi');
  const stockSymbols = ['ABEV3', 'AZUL4']; // Add more symbols as needed

  try {
    const stockData = await provider.getStockPrices(stockSymbols);

    for (const stock of stockData) {
      await sendStockData(stock); // This will send each stock's data to Firebase
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Stock data sent successfully' }),
    };
  } catch (error) {
    console.error('Error sending stock data:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Error sending stock data' }),
    };
  }
};
