const axios = require('axios');

class ApiService {
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: "https://cdn.jsdelivr.net/npm/@fawazahmed0",
    });
  }

  getCurrencies() {
    return this.axiosInstance.get('currency-api@latest/v1/currencies.json')
      .then(response => this.filterCurrencyData(response.data))
      .catch(error => {
        throw error;
      });
  }

  getLatestExchangeRate(currencyCode) {
    return this.axiosInstance.get(`currency-api@latest/v1/currencies/${currencyCode}.json`)
      .then(response => this.filterNestedCurrencyData(response.data))
      .catch(error => {
        throw error;
      });
  }

  getExchangeRateByDate(date, currencyCode) {
    return this.axiosInstance.get(`currency-api@${date}/v1/currencies/${currencyCode}.json`)
      .then(response => this.filterNestedCurrencyData(response.data))
      .catch(error => {
        throw error;
      });
  }

  filterCurrencyData(data) {
    const filteredData = {};
    Object.keys(data).forEach(key => {
      // check key is a 3-letter string
      if (/^[A-Za-z]{3}$/.test(key)) {
        filteredData[key] = data[key];
      }
    });
    return filteredData;
  }

  filterNestedCurrencyData(data) {
    const filteredData = {};
    filteredData["date"] = data["date"];
    Object.keys(data).forEach(key => {
      if (key !== 'date') {
        const nestedObject = data[key];
        filteredData[key] = {};

        Object.keys(nestedObject).forEach(nestedKey => {
          if (/^[a-z]{3}$/.test(nestedKey)) {
            filteredData[key][nestedKey] = nestedObject[nestedKey];
          }
        });
      }
    });
    
    return filteredData;
  }
}

// const api = new ApiService();
// api.getLatestExchangeRate("eur")
//   .then(data => console.log(data))
//   .catch(error => console.error('Error fetching the currencies:', error));

module.exports = ApiService;
