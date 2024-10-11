const { StockPriceFactory } = require('../src/factories/stock/StockPriceFactory'); // Adjust path
const { database } = require('../src/firebaseConfig'); // Adjust path
const { ref, set } = require('firebase/database');

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const currentTimestamp = formatDate(Date.now());

exports.handler = async (event, context) => {
    const provider = StockPriceFactory.createProvider('brapi');
    const stockSymbols = ['ABEV3', 'AZUL4']; // Add more symbols as needed

    try {
        const stockData = await provider.getStockPrices(stockSymbols);

        // Create an array of promises for each stock
        const promises = stockData.map(stock => {
            const latestRef = ref(database, 'stocks/' + stock.symbol + '/latest');
            const timestampRef = ref(database, `stocks/${stock.symbol}/${currentTimestamp}`);

            return Promise.all([
                set(latestRef, {
                    symbol: stock.symbol,
                    currentPrice: stock.regularMarketPrice,
                    change: stock.regularMarketChangePercent,
                    volume: stock.regularMarketVolume,
                    max: stock.regularMarketDayHigh,
                    min: stock.regularMarketDayLow,
                    fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
                    fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
                    previousClose: stock.regularMarketPreviousClose,
                }),
                set(timestampRef, {
                    symbol: stock.symbol,
                    currentPrice: stock.regularMarketPrice,
                    change: stock.regularMarketChangePercent,
                    volume: stock.regularMarketVolume,
                    max: stock.regularMarketDayHigh,
                    min: stock.regularMarketDayLow,
                    fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
                    fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
                    previousClose: stock.regularMarketPreviousClose,
                }),
            ]);
        });

        // Wait for all database writes to complete
        await Promise.all(promises);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Stock data sent successfully!' }),
        };
    } catch (error) {
        console.error('Error fetching or sending stock data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error fetching or sending stock data' }),
        };
    }
};