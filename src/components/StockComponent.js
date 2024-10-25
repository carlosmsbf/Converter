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

const stocksSymbol = ['ABEV3', 'AZUL4'/*, 'B3SA3', 'BHIA3', 'BBAS3', 'BBDC4', 'BPAC11',
    'BRAP4', 'BRFS3', 'CBAV3', 'CCRO3', 'CSAN3', 'EMBR3', 'GGBR4', 'ITRI11',
    'ITSA4', 'ITUB4', 'JBSS3', 'KNCA11', 'KNHF11', 'KNHY11', 'AMER3', 'LREN3',
    'MGLU3', 'PETR4', 'USIM5', 'VALE3', 'VGIR11', 'XPBR31'*/];

const StockComponent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDividends = async (symbol) => {
        const apiKey = '95DG6K3EICPXBOC1'; // Replace with your actual Alpha Vantage API key
        const url = `https://www.alphavantage.co/query?function=DIVIDEND&symbol=${symbol}&apikey=${apiKey}`;
    
        try {
            const response = await fetch(url);
            const data = await response.json();
    
            // Check for the correct structure in the API response
            if (data && data.dividends) {
                console.log(`Dividend data for ${symbol}:`, data);
                return {
                    lastDividendValue: data.dividends[0]?.amount // Adjust based on actual API response structure
                };
            }
            return null;
        } catch (error) {
            console.error(`Error fetching dividends for ${symbol}:`, error);
            return null; // Return null if there was an error
        }
    };

    const writeStockData = async () => {
        const provider = StockPriceFactory.createProvider('brapi');
        try {
            const stockData = await provider.getStockPrices(stocksSymbol);
            const dividendPromises = stockData.map(stock => fetchDividends(stock.symbol));

            // Fetch all dividends in parallel
            const dividends = await Promise.all(dividendPromises);

            // Loop through the fetched data and save each stock to Firebase
            stockData.forEach((stock, index) => {
                const lastDividendValue = dividends[index] ? dividends[index].lastDividendValue : null; // Get the corresponding dividend value
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
                    lastDividendValue: lastDividendValue // Add the fetched dividend value
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
            const stockData = await provider.getStockPrices(stocksSymbol);
            const dividendPromises = stockData.map(stock => fetchDividends(stock.symbol));

            // Fetch all dividends in parallel
            const dividends = await Promise.all(dividendPromises);

            stockData.forEach((stock, index) => {
                const lastDividendValue = dividends[index] ? dividends[index].lastDividendValue : null; // Get the corresponding dividend value
                set(ref(database, `stocks/${stock.symbol}/${currentTimestamp}`), {
                    symbol: stock.symbol,
                    currentPrice: stock.currentPrice,
                    change: stock.change,
                    volume: stock.volume,
                    max: stock.max,
                    min: stock.min,
                    fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
                    fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
                    previousClose: stock.previousClose,
                    lastDividendValue: lastDividendValue // Add the fetched dividend value
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
