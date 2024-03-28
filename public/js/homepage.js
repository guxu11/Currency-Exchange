async function fetchCurrencies() {
    try {
        const response = await fetch('/api/currencies');
        const data = await response.json();
        const fromCurrencyDropdown = document.getElementById('fromCurrency');
        const toCurrencyDropdown = document.getElementById('toCurrency');
        const currencyInfo = document.getElementById('currencyInfo');

        function updateCurrencyInfo() {
            const fromCurrency = fromCurrencyDropdown.value;
            const toCurrency = toCurrencyDropdown.value;
            const fromCurrencyText = fromCurrencyDropdown.options[fromCurrencyDropdown.selectedIndex].textContent;
            const toCurrencyText = toCurrencyDropdown.options[toCurrencyDropdown.selectedIndex].textContent;

            currencyInfo.textContent = `1 ${fromCurrencyText} = ... ${toCurrencyText}`;
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
                if (currencyCode.toLowerCase() === 'eur') {
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
    event.preventDefault(); // 阻止表单默认提交行为

    // 获取用户输入和选择的值
    const amount = document.getElementById('amount').value;
    const fromCurrency = document.getElementById('fromCurrency').value;
    const toCurrency = document.getElementById('toCurrency').value;

    // 发送数据到后端接口进行转换
    try {
        const response = await fetch('/api/convertCurrency', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount, fromCurrency, toCurrency }),
        });
        const result = await response.json();

        // 显示转换结果
        document.getElementById('result').value = result.convertedAmount;
    } catch (error) {
        console.error('Error converting currency:', error);
    }
}