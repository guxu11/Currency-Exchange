async function fetchCurrencies() {
    try {
        const response = await fetch('/api/currencies');
        const data = await response.json();
        const fromCurrencyDropdown = document.getElementById('fromCurrency');
        const toCurrencyDropdown = document.getElementById('toCurrency');
        const currencyInfo = document.getElementById('currencyInfo');
        const resultField = document.getElementById('result');

        async function updateCurrencyInfo() {
            const fromCurrency = fromCurrencyDropdown.value;
            const toCurrency = toCurrencyDropdown.value;
            const fromCurrencyText = fromCurrencyDropdown.options[fromCurrencyDropdown.selectedIndex].textContent;
            const toCurrencyText = toCurrencyDropdown.options[toCurrencyDropdown.selectedIndex].textContent;
            let amountToShow;
            try {
                const result = await callConvertCurrencyApi(1, fromCurrency, toCurrency);
                amountToShow = result.convertedAmount;
            } catch (error) {
                amountToShow = '?';
                console.error('Error converting currency:', error);
            }
            // Update the currency info text
            currencyInfo.textContent = `1 ${fromCurrencyText} = ${amountToShow} ${toCurrencyText}`;
            // Clear the result field
            resultField.value = '';
        }

        Object.keys(data).sort().forEach(currencyCode => {
            if (data[currencyCode]) {
                const optionFrom = document.createElement('option');
                const optionTo = document.createElement('option');
                optionFrom.value = currencyCode;
                optionTo.value = currencyCode;
                optionFrom.textContent = `${data[currencyCode]} (${currencyCode.toUpperCase()})`;
                optionTo.textContent = `${data[currencyCode]} (${currencyCode.toUpperCase()})`;

                // Set default values for USD and EUR
                if (currencyCode.toLowerCase() === 'usd') {
                    optionFrom.selected = true;
                }
                if (currencyCode.toLowerCase() === 'cnh') {
                    optionTo.selected = true;
                }

                fromCurrencyDropdown.appendChild(optionFrom);
                toCurrencyDropdown.appendChild(optionTo);
            }
        });

        fromCurrencyDropdown.addEventListener('change', updateCurrencyInfo);
        toCurrencyDropdown.addEventListener('change', updateCurrencyInfo);

        // Initialize the currency info text
        updateCurrencyInfo();

    } catch (error) {
        console.error('Error fetching the currencies:', error);
    }
}

async function convertCurrency(event) {
    event.preventDefault(); // prohibit form from auto submitting

    // Get the form data
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    // call backend API to get the conversion rate
    try {
        const result = await callConvertCurrencyApi(amount, fromCurrency, toCurrency);
        document.getElementById('result').value = result.convertedAmount;
    } catch (error) {
        console.error('Error converting currency:', error);
    }
}

async function callConvertCurrencyApi(amount, fromCurrency, toCurrency) {
    const response = await fetch('/api/convertCurrency', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount, fromCurrency, toCurrency }),
    });
    const data = await response.json();
    return data;
}