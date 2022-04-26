// Function will update the % change in median home values between two dates for all counties
function calcValueRates(start, end, homeValues) {
    var rates = {}
    var start_year_d = {}
    var end_year_d = {}
    // Retrieve data sets for corresponding years
    homeValues.forEach(d => {
        if (d["Year"] == start) {
            start_year_d = d;
        }
        if (d["Year"] == end) {
            end_year_d = d;
        }
    });

    // Perform data lookups & calculate the % difference
    for (var key in homeValues[0]) {
        rates[key] = ((end_year_d[key] - start_year_d[key]) / start_year_d[key]) * 100
    }
    return rates;
}

// Function will update the % change in median income between two dates for all counties
function calcIncomeRates(start, end, incomeValues) {
    var rates = {}
    var start_year_d = {}
    var end_year_d = {}
    incomeValues.forEach(d => {
        if (d["Year"] == start) {
            start_year_d = d;
        }
        if (d["Year"] == end) {
            end_year_d = d;
        }
    });
    for (var key in incomeValues[0]) {
        rates[key] = ((end_year_d[key] - start_year_d[key]) / start_year_d[key]) * 100
    }
    return rates;
}

// Function will determine the housing market health between two dates by 
// comparing change over time of median home price-to-income ratios for all counties
function calcCombinedRates(start, end, homeValues, incomeValues) {
    var startValue_d = null;
    var endValue_d = null;
    var startIncome_d = null;
    var endIncome_d = null;
    var rates = {}
    // Get both median home value and median income data for both years for all counties
    homeValues.forEach(d => {
        if (d["Year"] == start) {
            startValue_d = d;
        }
        if (d["Year"] == end) {
            endValue_d = d;
        }
    });
    incomeValues.forEach(d => {
        if (d["Year"] == start) {
            startIncome_d = d;
        }
        if (d["Year"] == end) {
            endIncome_d = d;
        }
    });
    // Caluclate the initial and the final homeprice-to-income ratio's for all counties
    var p2i_initial = {}
    var p2i_final = {}
    for (var key in startValue_d) {
        p2i_initial[key] = startValue_d[key] / startIncome_d[key]
    }
    for (var key in endValue_d) {
        p2i_final[key] = endValue_d[key] / endIncome_d[key]
    }
    // Calculate the overall housing market inflation rates between the timeframe
    for (var key in p2i_initial) {
        rates[key] = ((p2i_final[key] - p2i_initial[key]) / p2i_initial[key]) * 100;
    }
    return rates;
}
