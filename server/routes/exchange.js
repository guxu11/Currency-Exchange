const express = require('express');
const router = express.Router();
const exchangeController = require('../controllers/exchangeController');

/**
 * Currency exchange routes
 */

router.get('/', exchangeController.index);


module.exports = router;