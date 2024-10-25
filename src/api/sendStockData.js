const { StockPriceFactory } = require('../factories/stock/StockPriceFactory'); // Adjust path
const { database } = require('../firebaseConfig'); // Adjust path
const { ref, set } = require('firebase/database');

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const currentTimestamp = formatDate(Date.now());

exports.handler = async function (event, context) {
  const provider = StockPriceFactory.createProvider('brapi');
  const symbols = ['ABEV3', 'AZUL4', 'B3SA3', 'BHIA3', 'BBAS3', 'BBDC4', 'BPAC11',
        'BRAP4', 'BRFS3', 'CBAV3', 'CCRO3', 'CSAN3', 'EMBR3', 'GGBR4', 'ITRI11',
        'ITSA4', 'ITUB4', 'JBSS3', 'KNCA11', 'KNHF11', 'KNHY11', 'AMER3', 'LREN3',
        'MGLU3', 'PETR4', 'USIM5', 'VALE3', 'VGIR11', 'XPBR31'];  // Add symbols you need

  try {
    const stockData = await provider.getStockPrices(symbols);

    stockData.forEach(stock => {
      set(ref(database, 'stocks/' + stock.symbol + '/latest'), {
        symbol: stock.symbol,
        currentPrice: stock.regularMarketPrice,
        change: stock.regularMarketChangePercent,
        volume: stock.regularMarketVolume,
        max: stock.regularMarketDayHigh,
        min: stock.regularMarketDayLow,
        fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
        previousClose: stock.regularMarketPreviousClose,
        lastDividendValue: stock.lastDividendValue
      });
    });

    stockData.forEach(stock => {
        set(ref(database, `stocks/${stock.symbol}/${currentTimestamp}`), {
          symbol: stock.symbol,
          currentPrice: stock.regularMarketPrice,
          change: stock.regularMarketChangePercent,
          volume: stock.regularMarketVolume,
          max: stock.regularMarketDayHigh,
          min: stock.regularMarketDayLow,
          fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
          fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
          previousClose: stock.regularMarketPreviousClose,
          lastDividendValue: stock.lastDividendValue
        });
      });

    return {
      statusCode: 200,
      body: 'Stock data sent successfully!',
    };
  } catch (error) {
    console.error('Error fetching or sending stock data:', error);
    return {
      statusCode: 500,
      body: 'Error fetching or sending stock data',
    };
  }
};
