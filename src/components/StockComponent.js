import React, { useState } from 'react';
import { database } from '../firebaseConfig';
import { ref, set } from "firebase/database";
import { StockPriceFactory } from '../factories/stock/StockPriceFactory';

function formatDate(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

const currentTimestamp = formatDate(Date.now());

const stocksSymbol = ['ABEV3', 'AZUL4'/*, 'B3SA3', 'BHIA3', 'BBAS3', 'BBDC4', 'BPAC11',
    'BRAP4', 'BRFS3', 'CBAV3', 'CCRO3', 'CSAN3', 'EMBR3', 'GGBR4', 'ITRI11',
    'ITSA4', 'ITUB4', 'JBSS3', 'KNCA11', 'KNHF11', 'KNHY11', 'AMER3', 'LREN3',
    'MGLU3', 'PETR4', 'USIM5', 'VALE3', 'VGIR11', 'XPBR31'*/];

const fetchDividends = async (symbol) => {
    const apiKey = '95DG6K3EICPXBOC1'; // Replace with your actual Alpha Vantage API key
    const url = `https://www.alphavantage.co/query?function=DIVIDEND&symbol=${symbol}&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data && data.dividends) {
            return {
                lastDividendValue: data.dividends[0]?.amount // Adjust based on actual API response structure
            };
        }
        return { lastDividendValue: null }; // Return null if no dividends data found
    } catch (error) {
        console.error(`Error fetching dividends for ${symbol}:`, error);
        return { lastDividendValue: null };
    }
};

const StockComponent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const writeStockData = async () => {
        const provider = StockPriceFactory.createProvider('brapi');

        try {
            const stockData = await provider.getStockPrices(stocksSymbol);

            // Process each stock symbol and fetch dividends for each
            const savePromises = stockData.map(async stock => {
                const dividendData = await fetchDividends(stock.symbol);
                return set(ref(database, 'stocks/' + stock.symbol + '/latest'), {
                    symbol: stock.symbol,
                    currentPrice: stock.currentPrice,
                    change: stock.change,
                    volume: stock.volume,
                    max: stock.max,
                    min: stock.min,
                    fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
                    fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
                    previousClose: stock.previousClose,
                    lastDividendValue: dividendData.lastDividendValue // Add dividend data
                });
            });

            await Promise.all(savePromises);
            console.log('Stock data saved successfully');
        } catch (error) {
            console.error('Error fetching stock data:', error);
            setError('Error fetching stock data');
        }
    };

    const writeStockDataWithTimeStamp = async () => {
        const provider = StockPriceFactory.createProvider('brapi');

        try {
            const stockData = await provider.getStockPrices(stocksSymbol);

            // Process each stock symbol and fetch dividends for each
            const savePromises = stockData.map(async stock => {
                const dividendData = await fetchDividends(stock.symbol);
                return set(ref(database, `stocks/${stock.symbol}/${currentTimestamp}`), {
                    symbol: stock.symbol,
                    currentPrice: stock.currentPrice,
                    change: stock.change,
                    volume: stock.volume,
                    max: stock.max,
                    min: stock.min,
                    fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
                    fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
                    previousClose: stock.previousClose,
                    lastDividendValue: dividendData.lastDividendValue // Add dividend data
                });
            });

            await Promise.all(savePromises);
            console.log('Stock data with timestamp saved successfully');
        } catch (error) {
            console.error('Error fetching stock data:', error);
            setError('Error fetching stock data');
        }
    };

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        await Promise.all([writeStockData(), writeStockDataWithTimeStamp()]);
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
