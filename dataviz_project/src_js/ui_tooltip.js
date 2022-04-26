// Tool tip html.  Contains different HTML layout depending on
// whether or not the specified start and end year is the same
function updateToolTip(d) {
    var toolTipData = "";
    var rateProperty = "";
    var numProperty = "";
    var startYear = "";
    var endYear = "";
    var startValue = "";
    var endValue = "";
    var year = "Year: ";
    var mode = 1;
    var activeRateData = {}

    incomeValues.forEach(d => {
        if (d["Year"] == incomeStartYear) {
            incomeValueStart_d = d;
        }
        if (d["Year"] == incomeEndYear) {
            incomeValueEnd_d = d;
        }
    })
    homeValues.forEach(d => {
        if (d["Year"] == valueStartYear) {
            homeValueStart_d = d;
        }
        if (d["Year"] == valueEndYear) {
            homeValueEnd_d = d;
        }
    })
    if (activeMap == MAP_DIVS[0].id) {
        rateProperty = "Change in Median Home Value:";
        numProperty = "Median Home Value:";
        startYear = valueStartYear;
        endYear = valueEndYear;
        activeRateData = medianValueRates;
        startValue = homeValueStart_d[d.properties.GEO_ID]
        endValue = homeValueEnd_d[d.properties.GEO_ID]
    }
    else if (activeMap == MAP_DIVS[1].id) {
        rateProperty = "Change in Median Income:";
        numProperty = "Median Income:";
        startYear = incomeStartYear;
        endYear = incomeEndYear;
        activeRateData = medianIncomeRates;
        startValue = incomeValueStart_d[d.properties.GEO_ID]
        endValue = incomeValueEnd_d[d.properties.GEO_ID]
    }
    else if (activeMap == MAP_DIVS[2].id && combinedStartYear != combinedEndYear) {
        mode = 0;
        year = "";
        rateProperty = "Apprx. Housing Market Inflation:";
        for (var key in combinedRates) {
            activeRateData[key] = combinedRates[key] * -1;
        }
    }
    else {
        year = "";
    }
    if (startYear == endYear && mode == 1) {
        toolTipData =
            "<div class=\"p\">County / Municipality: " + "</div > " +
            "<div class=\"v\">" + d.properties['NAME'] + "</div>" +
            "<div class=\"p\">State / Territory:</div>" +
            "<div class=\"v\">" + d.properties['STATE_NAME'] + "</div>" +
            "<div id=\"year\">" + year + String(startYear) + "</div>" +
            "<div class=\"p\">" + numProperty + "</div>" +
            "<div class=\"v\">" + startValue + "</div>"
    }
    else {
        toolTipData =
            "<div class=\"p\">County / Municipality:" + "</div>" +
            "<div class=\"v\">" + d.properties['NAME'] + "</div>" +
            "<div class=\"p\">State / Territory:" + "</div>" +
            "<div class=\"v\">" + d.properties['STATE_NAME'] + "</div>" +
            "<div class=\"p\">" + rateProperty + "</div>" +
            "<div class=\"v\">" + String(activeRateData[d.properties["GEO_ID"]].toFixed(2)) + " %</div>" +
            "<div id=\"year_left\">" + year + String(startYear) + "</div>" +
            "<div id=\"year_right\">" + year + String(endYear) + "</div>" +
            "<div id=\"p\">" + numProperty + "</div>" +
            "<div id=\"v_left\">" + startValue + "</div>" +
            "<div id=\"v_right\">" + endValue + "</div>"

    }

    return toolTipData;
}