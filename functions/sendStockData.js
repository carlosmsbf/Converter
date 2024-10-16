const { StockPriceFactory } = require('../src/factories/stock/StockPriceFactory'); // Adjust path
const { database } = require('../src/firebaseConfig'); // Adjust path
const { ref, set } = require('firebase/database');

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const currentTimestamp = formatDate(Date.now());

exports.handler = async (event, context) => {
    const provider = StockPriceFactory.createProvider('brapi');
    const stockSymbols = ['ABEV3', 'AZUL4']; // Add more symbols as needed

    try {
        // Fetch stock data and handle errors
        let stockData;
        try {
            stockData = await provider.getStockPrices(stockSymbols);
            if (!stockData || stockData.length === 0) {
                throw new Error('No stock data returned from the API');
            }
        } catch (error) {
            console.error('Error fetching stock data:', error.message);
            return {
                statusCode: 500,
                body: JSON.stringify({ message: 'Error fetching stock data' }),
            };
        }

        // Ensure stockData is valid and proceed with processing
        const promises = stockData.map(stock => {
            // Check if stock properties exist, otherwise log the missing fields
            const symbol = stock.symbol || 'Unknown Symbol';
            const currentPrice = stock.regularMarketPrice || null;
            const change = stock.regularMarketChangePercent || null;
            const volume = stock.regularMarketVolume || null;
            const max = stock.regularMarketDayHigh || null;
            const min = stock.regularMarketDayLow || null;
            const fiftyTwoWeekHigh = stock.fiftyTwoWeekHigh || null;
            const fiftyTwoWeekLow = stock.fiftyTwoWeekLow || null;
            const previousClose = stock.regularMarketPreviousClose || null;

            // Log missing fields
            if (!currentPrice) console.warn(`Missing current price for ${symbol}`);
            if (!change) console.warn(`Missing change for ${symbol}`);
            if (!volume) console.warn(`Missing volume for ${symbol}`);
            if (!max) console.warn(`Missing max for ${symbol}`);
            if (!min) console.warn(`Missing min for ${symbol}`);

            const latestRef = ref(database, `stocks/${symbol}/latest`);
            const timestampRef = ref(database, `stocks/${symbol}/${currentTimestamp}`);

            // Store data in Firebase, handle errors if any occur
            return Promise.all([
                set(latestRef, {
                    symbol,
                    currentPrice,
                    change,
                    volume,
                    max,
                    min,
                    fiftyTwoWeekHigh,
                    fiftyTwoWeekLow,
                    previousClose,
                }).catch(err => {
                    console.error(`Error saving latest stock data for ${symbol}:`, err.message);
                }),
                set(timestampRef, {
                    symbol,
                    currentPrice,
                    change,
                    volume,
                    max,
                    min,
                    fiftyTwoWeekHigh,
                    fiftyTwoWeekLow,
                    previousClose,
                }).catch(err => {
                    console.error(`Error saving timestamped stock data for ${symbol}:`, err.message);
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
        console.error('Error processing stock data:', error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error processing stock data' }),
        };
    }
};
