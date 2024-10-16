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

async function updateStockDataToFirebase(stock) {
    const symbol = stock.symbol || 'Unknown Symbol';
    const stockData = {
        symbol,
        currentPrice: stock.regularMarketPrice || null,
        change: stock.regularMarketChangePercent || null,
        volume: stock.regularMarketVolume || null,
        max: stock.regularMarketDayHigh || null,
        min: stock.regularMarketDayLow || null,
        fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh || null,
        fiftyTwoWeekLow: stock.fiftyTwoWeekLow || null,
        previousClose: stock.regularMarketPreviousClose || null,
    };

    const latestRef = ref(database, `stocks/${symbol}/latest`);
    const timestampRef = ref(database, `stocks/${symbol}/${currentTimestamp}`);

    try {
        await Promise.all([
            set(latestRef, stockData),
            set(timestampRef, stockData),
        ]);
        console.log(`Stock data saved for ${symbol}`);
    } catch (error) {
        console.error(`Error saving stock data for ${symbol}:`, error.message);
    }
}

exports.handler = async (event, context) => {
    const provider = StockPriceFactory.createProvider('brapi');
    const stockSymbols = ['ABEV3', 'AZUL4']; // Add more symbols as needed

    try {
        // Fetch stock data
        const stockData = await provider.getStockPrices(stockSymbols);
        if (!stockData || stockData.length === 0) {
            throw new Error('No stock data returned from the API');
        }

        // Update Firebase with stock data for each symbol
        await Promise.all(stockData.map(stock => updateStockDataToFirebase(stock)));

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
