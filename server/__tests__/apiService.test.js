const axios = require('axios');
const ApiService = require('../services/ApiService');

// Mocking axios
jest.mock('axios');

describe('ApiService', () => {
  let apiService;

  beforeEach(() => {
    // Reset the axios mock before each test
    axios.create.mockReturnThis();
    apiService = new ApiService();
  });

  test('getCurrencies should return filtered data', async () => {
    // Mock axios response
    axios.get.mockResolvedValue({
      data: { USD: "United States Dollar", EUR: "Euro", invalid: "Invalid Data", XYZA: "Extra Data" }
    });

    const expected = { USD: "United States Dollar", EUR: "Euro" };
    await expect(apiService.getCurrencies()).resolves.toEqual(expected);
  });

  test('getLatestExchangeRate should return filtered exchange rate', async () => {
    // Mock axios response
    axios.get.mockResolvedValue({
      data: { date: "2024-01-01", eur: { usd: 1.1, eur: 1, invalid: "Invalid Data", xyza: "Extra Data" } }
    });

    const expected = { date: "2024-01-01", eur: { usd: 1.1, eur: 1 } };
    await expect(apiService.getLatestExchangeRate('eur')).resolves.toEqual(expected);
  });

  test('getExchangeRateByDate should return filtered data by date', async () => {
    // Mock axios response
    axios.get.mockResolvedValue({
      data: { date: "2024-01-01", usd: { jpy: 110.0, eur: 0.9, invalid: "Invalid Data" } }
    });

    const expected = { date: "2024-01-01", usd: { jpy: 110.0, eur: 0.9 } };
    await expect(apiService.getExchangeRateByDate('2024-01-01', 'usd')).resolves.toEqual(expected);
  });

});

