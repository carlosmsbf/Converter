export class ExchangeRateProvider {
    getExchangeRate(fromCurrency, toCurrency) {
      throw new Error("Method 'getExchangeRate()' must be implemented.");
    }
  }
  
  export class APIExchangeRateProvider extends ExchangeRateProvider {
    constructor() {
      super();
      this.apiUrl = `https://v6.exchangerate-api.com/v6/0c5acb95e3686666d8cd9367/latest/`;
    }
  
    async getExchangeRate(fromCurrency, toCurrency) {
      try {
        const response = await fetch(`${this.apiUrl}${fromCurrency}`);
        const data = await response.json();
  
        if (response.ok) {
          return data.conversion_rates[toCurrency];
        } else {
          throw new Error(data['error-type'] || 'Error fetching exchange rates');
        }
      } catch (error) {
        console.error("Error fetching exchange rate:", error);
        return null; // Handle error case
      }
    }
  }
  