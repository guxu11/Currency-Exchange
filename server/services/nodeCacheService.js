class CacheService {
  constructor() {
    this.cache = new Map();
    this.now = new Date();
    this.checkExpire = setInterval(() => this.checkExpire(), 60000);
  }

  checkExpire() {
    for (let key of this.cache.keys()) {
      if (key.has["expireAt"] && key["expireAt"] <= now) {
        this.cache.delete(key);
      }
    }
  }

  destroy() {
    clearInterval(this.checkExpire);
  }

  makeCurrenciesKey() {
    return 'currencies';
  }

  hasCurrencies() {
    return this.cache.has(this.makeCurrenciesKey());
  }

  getCurrencies() {
    return this.cache.get(this.makeCurrenciesKey())["data"];
  }

  setCurrencies(key, value) {
    this.cache.set(
      key, 
      {"data": value}
    );
  }

  setCurrenciesExpireToday(key, value) {
    const expireDate = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), 23, 59, 59);
    this.cache.set(key, {"data": value, "expireAt": expireDate});
  }

  /**
   * 
   * @param {*} key "fromCurrency|date", e.g. "usd|2024-01-01"
   * @param {*} value currency json, e.g. { "usd": 1, "eur": 0.84, "gbp": 0.76 }
   */

  setExchangeRate(key, value) {
    this.cache.set(key, {"data": value});
  }

  setExchangeRateExpireToday(key, value) {
    const expireDate = new Date(this.now.getFullYear(), this.now.getMonth(), this.now.getDate(), 23, 59, 59);
    this.cache.set(key, {"data": value, "expireAt": expireDate});
    console.log("cache", this.cache);
  }

  setExchangeRateTtl(key, value, ttl) {
    this.cache.set(key, {"data": value, "expireAt": new Date(now + ttl * 1000)});
  }

  hasExchangeRate(key) {
    return this.cache.has(key);
  }

  makeExchangeRateKey(from, date) {
    return `${from}|${date}`;
  }

  getExchangeRateJson(key) {
    return this.cache.get(key)["data"];
  }

  getExchangeRate(key, to) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key)["data"];
      return value[to];
    }
    return null;
  }
}

module.exports = CacheService;
