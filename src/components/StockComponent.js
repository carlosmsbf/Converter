
import React, { useState } from 'react';
import { database } from '..//firebaseConfig';
import { ref, set } from "firebase/database";
import { StockPriceFactory } from '../factories/stock/StockPriceFactory'; // Adjust path

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const currentTimestamp = formatDate(Date.now());

const stocksSymbol = ['ABEV3', 'AZUL4', 'B3SA3', 'BHIA3', 'BBAS3', 'BBDC4', 'BPAC11',
        'BRAP4', 'BRFS3', 'CBAV3', 'CCRO3', 'CSAN3', 'EMBR3', 'GGBR4', 'ITRI11',
        'ITSA4', 'ITUB4', 'JBSS3', 'KNCA11', 'KNHF11', 'KNHY11', 'AMER3', 'LREN3',
        'MGLU3', 'PETR4', 'USIM5', 'VALE3', 'VGIR11', 'XPBR31'];

const StockComponent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const writeStockData = async () => {
        const provider = StockPriceFactory.createProvider('brapi');
        try {
            // Fetch stock data using the symbols you're interested in
            const stockData = await provider.getStockPrices(stocksSymbol); // Add symbols as needed

            // Loop through the fetched data and save each stock to Firebase
            stockData.forEach(stock => {
                set(ref(database, 'stocks/' + stock.symbol + '/latest'), {
                    symbol: stock.symbol,
                    currentPrice: stock.currentPrice,
                    change: stock.change,
                    volume: stock.volume,
                    max: stock.max,
                    min: stock.min,
                    fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
                    fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
                    previousClose: stock.previousClose,
                    lastDividendValue: stock.lastDividendValue
                }).then(() => {
                    console.log(`Data saved for ${stock.symbol}`);
                }).catch((error) => {
                    console.error(`Error saving stock data for ${stock.symbol}: `, error);
                });
            });
        } catch (error) {
            console.error('Error fetching stock data:', error);
            setError('Error fetching stock data');
        }
    };

    const writeStockDataWithTimeStamp = async () => {
        const provider = StockPriceFactory.createProvider('brapi');
        try {
            // Fetch stock data using the symbols you're interested in
            const stockData = await provider.getStockPrices(stocksSymbol); // Add symbols as needed

            // Loop through the fetched data and save each stock to Firebase
            stockData.forEach(stock => {
                set(ref(database, `stocks/${stock.symbol}/${currentTimestamp}`), { // Using template literals
                    symbol: stock.symbol,
                    currentPrice: stock.currentPrice,
                    change: stock.change,
                    volume: stock.volume,
                    max: stock.max,
                    min: stock.min,
                    fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
                    fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
                    previousClose: stock.previousClose,
                    lastDividendValue: stock.lastDividendValue
                }).then(() => {
                    console.log(`Data saved for ${stock.symbol} with timestamp`);
                }).catch((error) => {
                    console.error(`Error saving stock data for ${stock.symbol}: `, error);
                });
            });
        } catch (error) {
            console.error('Error fetching stock data:', error);
            setError('Error fetching stock data');
        }
    };

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        await Promise.all([
            writeStockData(),
            writeStockDataWithTimeStamp(),
        ]);
        setLoading(false);
    };

    return (
        <div>
            <h1>Stock Data</h1>
            <button onClick={handleClick} disabled={loading}>
                {loading ? 'Loading...' : 'Submit Stock Data'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default StockComponent;
