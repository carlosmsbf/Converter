import { APIExchangeRateProvider } from './ExchangeRateProvider';

export class ExchangeRateFactory {
  static createProvider(type) {
    switch (type) {
      case 'api':
        return new APIExchangeRateProvider();
      default:
        throw new Error('Invalid provider type');
    }
  }
}
