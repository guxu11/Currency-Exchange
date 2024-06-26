async function fetchCurrenciesAndUpdateConvertPage() {
    try {
        const fromCurrencyDropdown = document.getElementById('fromCurrency');
        const toCurrencyDropdown = document.getElementById('toCurrency');
        await fetchCurrenciesAndFillSelect(fromCurrencyDropdown, toCurrencyDropdown);
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

        fromCurrencyDropdown.addEventListener('change', updateCurrencyInfo);
        toCurrencyDropdown.addEventListener('change', updateCurrencyInfo);

        // Initialize the currency info text
        updateCurrencyInfo();

    } catch (error) {
        console.error('Error fetching the currencies:', error);
    }
}

async function fetchCurrenciesAndFillSelect(fromCurrencyDropdown, toCurrencyDropdown) {
    if (fromCurrencyDropdown === null || toCurrencyDropdown === null) {
        fromCurrencyDropdown = document.getElementById('fromCurrency');
        toCurrencyDropdown = document.getElementById('toCurrency');
    }
    try {
        const data = await getCurrenciesData();

        Object.keys(data).forEach(currencyCode => {
            if (data[currencyCode]) {
                const optionFrom = document.createElement('option');
                const optionTo = document.createElement('option');
                optionFrom.value = currencyCode;
                optionTo.value = currencyCode;
                optionFrom.textContent = `${data[currencyCode]} (${currencyCode.toUpperCase()})`;
                optionTo.textContent = `${data[currencyCode]} (${currencyCode.toUpperCase()})`;

                // Set default values for USD and CNH
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
    } catch (error) {
        console.error('Error fetching the currencies:', error);
    }
}

async function getCurrenciesData() {
    try {
        const response = await fetch('/api/currencies');
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        return Object.keys(data)
            .sort()
            .filter(currencyCode => data[currencyCode])
            .reduce((acc, currencyCode) => {
                acc[currencyCode] = data[currencyCode];
                return acc;
            }, {});
    } catch (error) {
        console.error('Error fetching the currencies:', error);
        return {}; 
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

async function drawChart() {
    const fromCurrencyDropdown = document.getElementById('fromCurrency');
    const toCurrencyDropdown = document.getElementById('toCurrency');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const loadingOverlay = document.getElementById('loadingOverlay')

    // Function to wait until the currency dropdowns are not empty
    async function waitForCurrencies() {
        return new Promise((resolve) => {
            const checkCurrencies = setInterval(() => {
                if (fromCurrencyDropdown.value !== '' && toCurrencyDropdown.value !== '') {
                    clearInterval(checkCurrencies);
                    resolve();
                }
            }, 5);
        });
    }

    async function draw() {
        loadingIndicator.style.display = 'block'; 
        loadingOverlay.style.display = 'block';

        // Wait for both dropdowns to have a value
        await waitForCurrencies();

        const fromCurrency = fromCurrencyDropdown.value;
        const toCurrency = toCurrencyDropdown.value;

        // Check again if the values are not empty after the wait
        if (fromCurrency === '' || toCurrency === '') {
            loadingIndicator.style.display = 'none'; 
            loadingOverlay.style.display = 'none'; 
            return;
        }

        const response = await fetch(`/api/lastSevenDaysRates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ fromCurrency, toCurrency }),
        });
        const data = await response.json();

        loadingIndicator.style.display = 'none'; 
        loadingOverlay.style.display = 'none';

        // Prepare the data for the chart
        const labels = Object.keys(data).sort();
        const rateData = labels.map(label => data[label]);

        const ctx = document.getElementById('currencyChart').getContext('2d');
        if(window.currencyChart instanceof Chart) {
            window.currencyChart.destroy(); // Destroy the old chart instance if it exists
        }
        window.currencyChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `Exchange rate from ${fromCurrency.toUpperCase()} to ${toCurrency.toUpperCase()}`,
                    data: rateData,
                    borderColor: 'rgb(75, 192, 192)',
                    tension: 0.1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: false
                    }
                }
            }
        });
    }

    // Set up event listeners and trigger the drawing process
    fromCurrencyDropdown.addEventListener('change', draw);
    toCurrencyDropdown.addEventListener('change', draw);
    draw(); // Initially call draw to attempt loading the chart
}


function resizeCanvas() {
    window.addEventListener('resize', resizeCanvas, false);
    function resize() {
    const chartContainer = document.getElementById('chartContainer');
    const canvas = document.getElementById('currencyChart');
    const containerWidth = chartContainer.offsetWidth;

    canvas.width = containerWidth; 
    canvas.height = containerWidth / 2; 

    if (window.currencyChart instanceof Chart) {
        window.currencyChart.resize();
    }
}
    resize();
}

