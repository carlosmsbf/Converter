class StockPriceFactory {
    static createProvider(type) {
      switch (type) {
        case 'brapi':
          return new BrapiStockProvider();
        // Future providers can be added here
        default:
          throw new Error('Unknown stock price provider type');
      }
    }
  }
  
  class BrapiStockProvider {
    async getStockPrices(symbols) {
      const stockData = [];
  
      // Loop through the stock symbols and fetch each one by one
      for (const symbol of symbols) {
        try {
          const response = await fetch(`https://brapi.dev/api/quote/${symbol}?token=97uAUERxFJZazo9i3xKvGR`);
          const data = await response.json();
  
          if (data.results && data.results.length > 0) {
            const stock = data.results[0];
            /*const dividends = data.dividendsData.cashDividends[0];*/
            stockData.push({
              symbol: stock.symbol,
              currentPrice: stock.regularMarketPrice,
              change: stock.regularMarketChangePercent,
              volume: stock.regularMarketVolume, // Corrected "volum" to "volume"
              max: stock.regularMarketDayHigh,  // Max stock price for the day
              min: stock.regularMarketDayLow,   // Min stock price for the day
              fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,  // 52-week high
              fiftyTwoWeekLow: stock.fiftyTwoWeekLow,    // 52-week low
              previousClose: stock.regularMarketPreviousClose,  // Yesterday's close price
              lastDividendValue: stock.dividendsData.cashDividends[0].paymentDate.rate        
            });
          } else {
            console.error(`No stock data found for ${symbol}`);
          }
        } catch (error) {
          console.error(`Error fetching stock data for ${symbol}: ${error.message}`);
        }
      }
  
      return stockData;
    }
  }
  
  
  export { StockPriceFactory };
  