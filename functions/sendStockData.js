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
    console.log("Starting to fetch stock prices...");
    const provider = StockPriceFactory.createProvider('brapi');
    const stockSymbols = ['ABEV3', 'AZUL4']; // Add more symbols as needed

    let stockData;

    // Fetch stock data with proper error handling
    try {
        console.log(`Fetching stock prices for symbols: ${stockSymbols.join(', ')}`);
        stockData = await provider.getStockPrices(stockSymbols);

        // Check if stockData is valid
        if (!stockData || stockData.length === 0) {
            throw new Error('Stock data is undefined or empty.');
        }
        console.log("Stock prices fetched successfully:", stockData);
    } catch (error) {
        console.error(`Error fetching stock prices: ${error.message}`);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `Error fetching stock prices for ${stockSymbols.join(', ')}.`,
                error: error.message,
            }),
        };
    }

    // Create an array of promises for each stock with individual try-catch blocks
    const promises = stockData.map(async (stock) => {
        const latestRef = ref(database, 'stocks/' + stock.symbol + '/latest');
        const timestampRef = ref(database, `stocks/${stock.symbol}/${currentTimestamp}`);

        try {
            console.log(`Sending latest stock data for ${stock.symbol}`);
            await set(latestRef, {
                symbol: stock.symbol,
                currentPrice: stock.regularMarketPrice,
                change: stock.regularMarketChangePercent,
                volume: stock.regularMarketVolume,
                max: stock.regularMarketDayHigh,
                min: stock.regularMarketDayLow,
                fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
                previousClose: stock.regularMarketPreviousClose,
            });
            console.log(`Latest stock data for ${stock.symbol} sent successfully`);
        } catch (error) {
            console.error(`Error sending latest stock data for ${stock.symbol}: ${error.message}`);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: `Error sending latest stock data for ${stock.symbol}. ${stock.regularMarketPrice}`,
                    error: error.message,
                }),
            };
        }

        try {
            console.log(`Sending timestamped stock data for ${stock.symbol}`);
            await set(timestampRef, {
                symbol: stock.symbol,
                currentPrice: stock.regularMarketPrice,
                change: stock.regularMarketChangePercent,
                volume: stock.regularMarketVolume,
                max: stock.regularMarketDayHigh,
                min: stock.regularMarketDayLow,
                fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
                fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
                previousClose: stock.regularMarketPreviousClose,
            });
            console.log(`Timestamped stock data for ${stock.symbol} sent successfully`);
        } catch (error) {
            console.error(`Error sending timestamped stock data for ${stock.symbol}: ${error.message}`);
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: `Error sending timestamped stock data for ${stock.symbol}.`,
                    error: error.message,
                }),
            };
        }
    });

    // Wait for all database writes to complete
    try {
        console.log("Waiting for all stock data to be sent...");
        const results = await Promise.all(promises);
        const failedStocks = results.filter(result => result && result.statusCode === 500);

        if (failedStocks.length) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    message: 'Some stock data failed to send.',
                    failedStocks: failedStocks.map(failure => failure.body),
                }),
            };
        }

        console.log("All stock data sent successfully");
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Stock data sent successfully!' }),
        };
    } catch (error) {
        console.error('Error sending stock data:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error processing stock data in the final step.',
                error: error.message,
            }),
        };
    }
};
