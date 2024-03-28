const CacheService = require('../services/nodeCacheService');
const cacheService = new CacheService();
const ApiService = require('../services/apiService');
const { cache } = require('ejs');
const apiService = new ApiService();

const exchange = (req, res) => {

    res.render('home');
};

const fetchCurrencies = async (req, res) => {
    try {
        const key = cacheService.makeCurrenciesKey();
        if (cacheService.hasCurrencies()) {
            const data = cacheService.getCurrencies(key);
            res.json(data);
            return;
        }
        const data = await apiService.getCurrencies();
        cacheService.setCurrenciesExpireToday(key, data);
        res.json(data);
    } catch (error) {
        console.error('Error fetching the currencies:', error);
        res.status(500).send('Error fetching the currencies');
    }
};

const convertCurrency = async (req, res) => {
    const { amount, fromCurrency, toCurrency } = req.body;
    console.log(amount, fromCurrency, toCurrency);
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const key = cacheService.makeExchangeRateKey(fromCurrency, formattedDate);
    console.log("key", key);
    let exchangeRates;
    if (cacheService.hasExchangeRate(key)) {
        console.log('Cache hit');
        exchangeRates = cacheService.getExchangeRateJson(key);
    } else {
        console.log('Cache miss');
        const rawExchangeRates = await apiService.getLatestExchangeRate(fromCurrency);
        exchangeRates = rawExchangeRates[fromCurrency];
        cacheService.setExchangeRateExpireToday(key, exchangeRates);
        // console.log(cacheService.cache.entries());
    }
    console.log(exchangeRates);
    const convertedAmount = amount * exchangeRates[toCurrency];
    console.log(convertedAmount);
    res.json({ convertedAmount });
};

module.exports = {
    exchange,
    fetchCurrencies,
    convertCurrency
};