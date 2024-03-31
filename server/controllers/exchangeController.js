const CacheService = require('../services/nodeCacheService');
const cacheService = new CacheService();
const ApiService = require('../services/apiService');
const apiService = new ApiService();

const exchange = (req, res) => {
    res.render('homepage');
};

const fluctuate = (req, res) => {
    res.render('fluctuate');
}

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
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    const key = cacheService.makeExchangeRateKey(fromCurrency, formattedDate);
    process.stdout.write(`key: ${key} `);

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
    const convertedAmount = amount * exchangeRates[toCurrency];
    res.json({ convertedAmount });
};

const fetchLast7DaysRates = async (req, res) => {
    const { fromCurrency, toCurrency } = req.body;
    console.log(fromCurrency, toCurrency);
    const today = new Date();
    const exchangeRates = {};
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const formattedDate = date.toISOString().split('T')[0];
        const key = cacheService.makeExchangeRateKey(fromCurrency, formattedDate);
        if (cacheService.hasExchangeRate(key)) {
            console.log('Cache hit');
            exchangeRates[formattedDate] = cacheService.getExchangeRateJson(key)[toCurrency];
        } else {
            console.log('Cache miss');
            const rawExchangeRates = await apiService.getExchangeRateByDate(formattedDate, fromCurrency);
            const fromCurrencyRates = rawExchangeRates[fromCurrency];
            exchangeRates[formattedDate] = fromCurrencyRates[toCurrency]
            cacheService.setExchangeRateExpireToday(key, fromCurrencyRates);
        }
    }
    console.log(exchangeRates);
    res.json(exchangeRates);
}

module.exports = {
    exchange,
    fluctuate,
    fetchCurrencies,
    convertCurrency,
    fetchLast7DaysRates
};