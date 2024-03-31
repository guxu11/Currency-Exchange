const CacheService = require('../services/nodeCacheService');

describe('CacheService', () => {
  let cacheService;
  let originalDateNow;

  beforeEach(() => {
    cacheService = new CacheService();
    originalDateNow = Date.now;
    Date.now = jest.fn(() => new Date('2024-01-01T12:00:00Z').getTime()); // Mocking Date.now
  });

  afterEach(() => {
    cacheService.destroy();
    Date.now = originalDateNow; // Restore original Date.now function
  });

  test('should store and retrieve currencies correctly', () => {
    const key = cacheService.makeCurrenciesKey();
    const currencies = { usd: 1, eur: 0.9 };
    
    cacheService.setCurrencies(key, currencies);
    expect(cacheService.hasCurrencies()).toBeTruthy();
    expect(cacheService.getCurrencies()).toEqual(currencies);
  });

  test('should set and retrieve exchange rate correctly', () => {
    const from = 'usd';
    const date = '2024-01-01';
    const exchangeRateKey = cacheService.makeExchangeRateKey(from, date);
    const exchangeRates = { eur: 0.9, gbp: 0.8 };

    cacheService.setExchangeRate(exchangeRateKey, exchangeRates);
    expect(cacheService.hasExchangeRate(exchangeRateKey)).toBeTruthy();
    expect(cacheService.getExchangeRateJson(exchangeRateKey)).toEqual(exchangeRates);
  });

  test('should get specific exchange rate using getExchangeRate method', () => {
    const from = 'usd';
    const to = 'eur';
    const date = '2024-01-01';
    const exchangeRateKey = cacheService.makeExchangeRateKey(from, date);
    const exchangeRates = { eur: 0.9, gbp: 0.8 };
    
    cacheService.setExchangeRate(exchangeRateKey, exchangeRates);
    expect(cacheService.getExchangeRate(exchangeRateKey, to)).toBe(0.9);
  });

});
