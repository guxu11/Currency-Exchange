const express = require('express');
const router = express.Router();
const exchangeController = require('../controllers/exchangeController');

/**
 * Currency exchange routes
 */

router.get('/', exchangeController.exchange);
router.get('/fluctuate', exchangeController.fluctuate)
router.get('/api/currencies', exchangeController.fetchCurrencies);
router.post('/api/convertCurrency', exchangeController.convertCurrency);
router.post('/api/lastSevenDaysRates', exchangeController.fetchLast7DaysRates);

module.exports = router;