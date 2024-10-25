class StockPriceFactory {
  static createProvider(type) {
      switch (type) {
          case 'brapi':
              return new BrapiStockProvider();
          case 'alphavantage':
              return new AlphaVantageStockProvider();
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
          const response = await fetch(`https://brapi.dev/api/quote/${symbol}?fundamental=true&token=97uAUERxFJZazo9i3xKvGR`);
          const data = await response.json();
  
          if (data.results && data.results.length > 0) {
            const stock = data.results[0];
            const stockD = data;

            console.log(`Dividend data for ${symbol}:`, stock.dividendsData);
            console.log(`Dividend data for ${symbol}:`, stockD);

            const lastDividend = stock.dividendsData?.cashDividends?.[0];
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
              lastDividendValue: lastDividend ? lastDividend.rate : null       
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
  


class AlphaVantageStockProvider {
  constructor(apiKey) {
      this.apiKey = `95DG6K3EICPXBOC1`; // Set your Alpha Vantage API key here
  }

  async getStockPrices(symbols) {
      const stockData = [];

      // Loop through the stock symbols and fetch each one by one
      for (const symbol of symbols) {
          try {
              const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&apikey=${this.apiKey}`);
              const data = await response.json();

              if (data['Time Series (Daily)']) {
                  const dailyData = data['Time Series (Daily)'];
                  const latestDate = Object.keys(dailyData)[0];
                  const latestEntry = dailyData[latestDate];
                  
                  // Check if there's a dividend for the latest entry
                  const dividendAmount = parseFloat(latestEntry['7. dividend amount']);
                  
                  stockData.push({
                      symbol: symbol,
                      currentPrice: parseFloat(latestEntry['4. close']),
                      change: null, // Alpha Vantage does not provide change percentage directly
                      volume: parseInt(latestEntry['5. volume']),
                      max: parseFloat(latestEntry['2. high']),
                      min: parseFloat(latestEntry['3. low']),
                      fiftyTwoWeekHigh: null, // Additional logic needed for 52-week high
                      fiftyTwoWeekLow: null, // Additional logic needed for 52-week low
                      previousClose: parseFloat(latestEntry['4. close']), // Use close price for previous close
                      lastDividendValue: !isNaN(dividendAmount) ? dividendAmount : null // Check if dividend amount is valid
                  });
              } else {
                  console.error(`No stock data found for ${symbol} from Alpha Vantage`);
              }
          } catch (error) {
              console.error(`Error fetching stock data from Alpha Vantage for ${symbol}: ${error.message}`);
          }
      }

      return stockData;
  }
}
  
  export { StockPriceFactory };
  