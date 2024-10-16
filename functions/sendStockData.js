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
            const symbol = stock.symbol;
            const currentPrice = stock.regularMarketPrice;
            const change = stock.regularMarketChangePercent;
            const volume = stock.regularMarketVolume;
            const max = stock.regularMarketDayHigh;
            const min = stock.regularMarketDayLow;
            const fiftyTwoWeekHigh = stock.fiftyTwoWeekHigh;
            const fiftyTwoWeekLow = stock.fiftyTwoWeekLow;
            const previousClose = stock.regularMarketPreviousClose;


            if (symbol === 'Unknown') {
                console.error('Stock symbol is undefined for one of the fetched stocks');
            }

            const latestRef = ref(database, 'stocks/' + symbol + '/latest');
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