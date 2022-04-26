
// Update map, updates color scale, the callc ColorMap to fill
function updateMap(rateData) {
    // Take extent of new data range
    var extent = d3.extent(Object.values(rateData));
    // Update coloring scale based on the new data
    var sorted = Object.values(rateData).sort(d3.ascending);
    sorted.map(d => { return d.toFixed(2) });
    let scale = d3.scaleDiverging()
        .domain([extent[0], 0, extent[1]], (d) => {       //a min to max scale with '0' value is nuetral
            return d;
        });
    // Color the map
    colorMap(scale, rateData);
}

// Color map fills (colors) the active map
function colorMap(scale, rateData) {
    // D3 coloring interpolation using previously defined coloring scale - uses D3 Red-to-Blue coloring Scheme
    var colorInterpolator = d3.interpolateRdBu;
    // Color (fill) the map
    d3.selectAll("#" + activeMap + " path")
        .attr("fill", (d) => {
            for (var key in rateData) {
                if (d.properties["GEO_ID"] == key) {
                    //console.log(d.properties["NAME"] + ": " + rateData[key]);
                    return colorInterpolator(scale(rateData[key]));
                }
            }
        });
}

// Handles zoom feature on active map
function handleZoom(e) {
    d3.select("#" + activeMap + ' svg g')
        .attr('transform', e.transform);
}
