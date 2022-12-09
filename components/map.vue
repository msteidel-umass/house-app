<template>
  <div>
    <v-row class="pa-5">
      <v-col cols="4">
        <v-card outlined class="menu">
          <div class="card-title">Adjust Years of Interest</div>
          <v-row class="pa-3" style="text-align: center">
            <v-col cols="3">
              <div id="t1" class="text_box"></div>
            </v-col>
            <v-col>
              <div id="control_overlay"></div>
            </v-col>
            <v-col cols="3">
              <div id="t2" class="text_box ma-0"></div>
            </v-col>
          </v-row>
        </v-card>
        <v-card outlined class="menu">
          <div class="card-title">State</div>
          <div class="pa-3" style="text-align: center">
            <v-select :options ="states"></v-select>
          </div>
        </v-card>
        <v-card outlined class="menu">
          <div class="card-title">Display</div>
          <div class="pa-3" style="text-align: center">
            <v-btn
              block
              fab
              large
              outlined
              tile
              x-small
              @click="toggleMap('incomes')"
            >
              <span class="buttonText">Incomes</span></v-btn
            >

            <v-btn
              block
              fab
              large
              outlined
              tile
              x-small
              @click="toggleMap('home_values')"
              ><span class="buttonText">House Prices</span></v-btn
            >

            <v-btn
              block
              fab
              large
              outlined
              tile
              x-small
              @click="toggleMap('combined')"
              ><span class="buttonText"> Market Health </span></v-btn
            >
          </div>
        </v-card>
        <v-card outlined class="menu">
          <div class="card-title">Legend</div>
          <div class="pa-5" style="text-align: center">
            <div id="legend"></div>
          </div>
        </v-card>
      </v-col>
      <v-col style="text-align: center" id="d3-map" cols="8">
        <v-container class="container">
          <load-spinner v-if="showHideSpinner" />
          <div id="home_values" class="map"></div>
          <div id="incomes" class="map"></div>
          <div id="combined" class="map"></div>
        </v-container>
      </v-col>
      <v-col>
        <div id="tooltip"></div>
      </v-col>
    </v-row>
  </div>
</template>
<script>
import {
  computed,
  defineComponent,
  onMounted,
  ref,
} from "@nuxtjs/composition-api";
import loadSpinner from "@/components/load_spinner.vue";
import vselect from "@/components/select.vue";
import * as d3 from "d3";

export default defineComponent({
  name: "Map",
  components: { loadSpinner },
  setup() {
    // Define geo json & csv file(s)
    const US_COUNTIES = "/us_counties_geo.json";
    const HOME_VALS = "/median_house_values.csv";
    const INCOMES = "/median_incomes.csv";
    // Array contains html ID names corresponding to each div containing a map (SVG)
    const MAP_DIVS = document.getElementsByClassName("map");

    //Map Padding
    const mapPadding = 20;

    // Vars used to specifcy the specific years retrieve housing/income data for each page
    var valueStartYear = null;
    var valueEndYear = null;
    var incomeStartYear = null;
    var incomeEndYear = null;
    var combinedStartYear = null;
    var combinedEndYear = null;
    // Init vars to keep track of the actively displayed div (SVG) and corresponding map data
    var activeMap = null;
    var activeRateData = {};
    // Dics to hold median home value and median income value data
    let homeValues = {};
    let incomeValues = {};
    let geoJsonCounties = {};
    // Dictionaries which will hold re-calculated (home,income,health) data values for each county
    // These are what's used used to fill/re-color each SVG map
    var medianValueRates = {};
    var medianIncomeRates = {};
    var combinedRates = {};
    // D3 coloring interpolation using previously defined coloring scale - uses D3 Red-to-Blue coloring Scheme
    var colorInterpolator = d3.interpolateRdBu;

    //Loading screen
    let showSpinner = ref(true);
    let showHideSpinner = computed(() => {
      return showSpinner.value;
    });

    onMounted(() => {
      drawMap();
    });

    // Define function to create toggle map btns
    function createToggleBtn(parentDiv, divControlled, btnText, toggleFunc) {
      var btn = document.createElement("button");
      btn.classList.add("toggle_btn");
      btn.innerText = btnText;
      btn.value = divControlled;
      btn.onclick = function () {
        toggleFunc(divControlled);
      };
      document.getElementById(parentDiv).appendChild(btn);
      return btn;
    }

    // Define toggle map functionality--used to change the 'active' map div/SVG that's displayed
    function toggleMap(divName) {
      if (divName == MAP_DIVS[0].id && activeMap != MAP_DIVS[0].id) {
        document.getElementById(MAP_DIVS[0].id).style.display = "initial";
        document.getElementById(MAP_DIVS[1].id).style.display = "none";
        document.getElementById(MAP_DIVS[2].id).style.display = "none";
        activeMap = MAP_DIVS[0].id;
        setSliderDates(valueStartYear, valueEndYear);
      } else if (divName == MAP_DIVS[1].id && activeMap != MAP_DIVS[1].id) {
        document.getElementById(MAP_DIVS[0].id).style.display = "none";
        document.getElementById(MAP_DIVS[1].id).style.display = "initial";
        document.getElementById(MAP_DIVS[2].id).style.display = "none";
        activeMap = MAP_DIVS[1].id;
        setSliderDates(incomeStartYear, incomeEndYear);
      } else if (divName == MAP_DIVS[2].id && activeMap != MAP_DIVS[2].id) {
        document.getElementById(MAP_DIVS[0].id).style.display = "none";
        document.getElementById(MAP_DIVS[1].id).style.display = "none";
        document.getElementById(MAP_DIVS[2].id).style.display = "initial";
        activeMap = MAP_DIVS[2].id;
        setSliderDates(combinedStartYear, combinedEndYear);
      }
      // Function call to switch the styling of active toggle button
      styleActiveToggleBtn();
      updateLegend();
      console.log(activeMap);
    }

    // Change the styling of toggle buttons, depending on active/inactive status
    function styleActiveToggleBtn() {
      var btns = Array.from(document.getElementsByClassName("toggle_btn"));
      btns.forEach((b) => {
        if (b.value == activeMap) {
          b.style.backgroundColor = "steelblue";
          b.style.borderColor = "steelblue";
        } else {
          b.style.backgroundColor = "cornflowerblue";
          b.style.borderColor = "cornflowerblue";
        }
      });
    }

    // Update legend content after toggle for each "map" page
    function updateLegend() {
      var title = "";
      var attr1 = "";
      var attr2 = "";
      if (activeMap == MAP_DIVS[0].id) {
        title = "% Change in Median Home Values";
        attr1 = "Home Value Decrease";
        attr2 = "Home Value Increase";
      } else if (activeMap == MAP_DIVS[1].id) {
        title = "% Change in Median Income";
        attr1 = "Income Decrease";
        attr2 = "Income Increase";
      } else if (activeMap == MAP_DIVS[2].id) {
        title = "% Market Inflation";
        attr1 = "Market Over-valued";
        attr2 = "Market Under-valued";
      }

      document.getElementById("legend").innerHTML =
        '<p id="a1">' + attr1 + "</p>" + '<p id="a2">' + attr2 + "</p>";
    }
    // Define function to create a range slider input for user to select start/end dates
    function dualSliderInput(div, min, max, changeYears) {
      // Create single dual-input range slider composed w/two standard sliders
      var s1 = document.createElement("input");
      var s2 = document.createElement("input");
      s1.classList.add("range_slider");
      s2.classList.add("range_slider");
      s1.name = "s1";
      s2.name = "s2";
      s1.type = s2.type = "range";
      s1.min = s2.min = min;
      s1.max = s2.max = max;
      s1.step = s2.step = 1;
      // Create text display divs to append their input text to
      /*
      var t1 = document.createElement("div");
      var t2 = document.createElement("div");
      t1.classList.add("text_box");
      t2.classList.add("text_box");
      t1.id = "t1";
      t2.id = "t2";
      */
      // Add functionality to sliders
      s1.onmouseup = function () {
        changeYears(s1.value, s2.value);
      };
      s2.onmouseup = function () {
        changeYears(s1.value, s2.value);
      };
      // Append everything to the parent (#control_overlay) div in the correct ordering
      //document.getElementById(div).appendChild(t1);
      document.getElementById(div).appendChild(s2);
      document.getElementById(div).appendChild(s1);
      //document.getElementById(div).appendChild(t2);
      //return [s1, s2, t1, t2];
      return [s1, s2];
    }

    // Additional slider control logic--
    // Resets slider knob positions during a page toggle and
    // ensures both sliders control togeather to simulate a single dual slider
    function controlSlider(start = null, end = null) {
      var s1 = document.getElementsByName("s1")[0];
      var s2 = document.getElementsByName("s2")[0];
      // If arguments were provided, overide controls and set sliders to arguments
      if (start != null && end != null) {
        s1.value = start;
        s2.value = end;
      }
      // Else control using dual-slider control logic
      else if (s2.value > s1.value) {
        s1.style.display = "initial";
        s2.style.display = "initial";
      } else if (this == s2 && s2.value < s1.value) {
        s1.value = s2.value;
        s1.style.display = "none";
      } else if (this == s1 && s1.value > s2.value) {
        s2.value = s1.value;
        s2.style.display = "none";
      }
      // update the slider's text box  divs to display the selected input (years)
      updateTextBox(s1.value, s2.value);
    }

    // Updates the date slider's text boxes with their respective input values
    function updateTextBox(value1, value2) {
      let textBox1 = document.getElementById("t1");
      let textBox2 = document.getElementById("t2");
      textBox1.innerHTML = value1;
      textBox2.innerHTML = value2;
    }

    // Passes slider values as arguments to slider controlSlider func
    // to force-reset it with new values
    function setSliderDates(start, end) {
      controlSlider(start, end);
    }

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
      var activeRateData = {};
      var incomeValueStart_d = "";
      var incomeValueEnd_d = "";
      var homeValueStart_d = "";
      var homeValueEnd_d = "";

      incomeValues.forEach((d) => {
        if (d["Year"] == incomeStartYear) {
          incomeValueStart_d = d;
        }
        if (d["Year"] == incomeEndYear) {
          incomeValueEnd_d = d;
        }
      });
      homeValues.forEach((d) => {
        if (d["Year"] == valueStartYear) {
          homeValueStart_d = d;
        }
        if (d["Year"] == valueEndYear) {
          homeValueEnd_d = d;
        }
      });
      if (activeMap == MAP_DIVS[0].id) {
        rateProperty = "Change in Median Home Value:";
        numProperty = "Median Home Value:";
        startYear = valueStartYear;
        endYear = valueEndYear;
        activeRateData = medianValueRates;
        startValue = homeValueStart_d[d.properties.GEO_ID];
        endValue = homeValueEnd_d[d.properties.GEO_ID];
      } else if (activeMap == MAP_DIVS[1].id) {
        rateProperty = "Change in Median Income:";
        numProperty = "Median Income:";
        startYear = incomeStartYear;
        endYear = incomeEndYear;
        activeRateData = medianIncomeRates;
        startValue = incomeValueStart_d[d.properties.GEO_ID];
        endValue = incomeValueEnd_d[d.properties.GEO_ID];
      } else if (
        activeMap == MAP_DIVS[2].id &&
        combinedStartYear != combinedEndYear
      ) {
        mode = 0;
        year = "";
        rateProperty = "Apprx. Housing Market Inflation:";
        for (var key in combinedRates) {
          activeRateData[key] = combinedRates[key] * -1;
        }
      } else {
        year = "";
      }
      if (startYear == endYear && mode == 1) {
        toolTipData =
          '<div class="p">County / Municipality: ' +
          "</div > " +
          '<div class="v">' +
          d.properties["NAME"] +
          "</div>" +
          '<div class="p">State / Territory:</div>' +
          '<div class="v">' +
          d.properties["STATE_NAME"] +
          "</div>" +
          '<div id="year">' +
          year +
          String(startYear) +
          "</div>" +
          '<div class="p">' +
          numProperty +
          "</div>" +
          '<div class="v">' +
          startValue +
          "</div>";
      } else {
        toolTipData =
          '<div class="p">County / Municipality:' +
          "</div>" +
          '<div class="v">' +
          d.properties["NAME"] +
          "</div>" +
          '<div class="p">State / Territory:' +
          "</div>" +
          '<div class="v">' +
          d.properties["STATE_NAME"] +
          "</div>" +
          '<div class="p">' +
          rateProperty +
          "</div>" +
          '<div class="v">' +
          String(activeRateData[d.properties["GEO_ID"]].toFixed(2)) +
          " %</div>" +
          '<div id="year_left">' +
          year +
          String(startYear) +
          "</div>" +
          '<div id="year_right">' +
          year +
          String(endYear) +
          "</div>" +
          '<div id="p">' +
          numProperty +
          "</div>" +
          '<div id="v_left">' +
          startValue +
          "</div>" +
          '<div id="v_right">' +
          endValue +
          "</div>";
      }

      return toolTipData;
    }

    // Update map, updates color scale, the callc ColorMap to fill
    function updateMap(rateData) {
      // Take extent of new data range
      var extent = d3.extent(Object.values(rateData));
      // Update coloring scale based on the new data
      var sorted = Object.values(rateData).sort(d3.ascending);
      sorted.map((d) => {
        return d.toFixed(2);
      });
      let scale = d3.scaleDiverging().domain([extent[0], 0, extent[1]], (d) => {
        //a min to max scale with '0' value is nuetral
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
      d3.selectAll("#" + activeMap + " path").attr("fill", (d) => {
        for (var key in rateData) {
          if (d.properties["GEO_ID"] == key) {
            //console.log(d.properties["NAME"] + ": " + rateData[key]);
            return colorInterpolator(scale(rateData[key]));
          }
        }
      });
    }

    // Function will update the % change in median home values between two dates for all counties
    function calcValueRates(start, end, homeValues) {
      var rates = {};
      var start_year_d = {};
      var end_year_d = {};
      // Retrieve data sets for corresponding years
      homeValues.forEach((d) => {
        if (d["Year"] == start) {
          start_year_d = d;
        }
        if (d["Year"] == end) {
          end_year_d = d;
        }
      });

      // Perform data lookups & calculate the % difference
      for (var key in homeValues[0]) {
        rates[key] =
          ((end_year_d[key] - start_year_d[key]) / start_year_d[key]) * 100;
      }
      return rates;
    }

    // Function will update the % change in median income between two dates for all counties
    function calcIncomeRates(start, end, incomeValues) {
      var rates = {};
      var start_year_d = {};
      var end_year_d = {};
      incomeValues.forEach((d) => {
        if (d["Year"] == start) {
          start_year_d = d;
        }
        if (d["Year"] == end) {
          end_year_d = d;
        }
      });
      for (var key in incomeValues[0]) {
        rates[key] =
          ((end_year_d[key] - start_year_d[key]) / start_year_d[key]) * 100;
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
      var rates = {};
      // Get both median home value and median income data for both years for all counties
      homeValues.forEach((d) => {
        if (d["Year"] == start) {
          startValue_d = d;
        }
        if (d["Year"] == end) {
          endValue_d = d;
        }
      });
      incomeValues.forEach((d) => {
        if (d["Year"] == start) {
          startIncome_d = d;
        }
        if (d["Year"] == end) {
          endIncome_d = d;
        }
      });
      // Caluclate the initial and the final homeprice-to-income ratio's for all counties
      var p2i_initial = {};
      var p2i_final = {};
      for (var key in startValue_d) {
        p2i_initial[key] = startValue_d[key] / startIncome_d[key];
      }
      for (var key in endValue_d) {
        p2i_final[key] = endValue_d[key] / endIncome_d[key];
      }
      // Calculate the overall housing market inflation rates between the timeframe
      for (var key in p2i_initial) {
        rates[key] =
          ((p2i_final[key] - p2i_initial[key]) / p2i_initial[key]) * 100;
      }
      return rates;
    }

    // Handles zoom feature on active map
    function handleZoom(e) {
      d3.select("#" + activeMap + " svg g").attr("transform", e.transform);
    }

    // DATA / UPDATING VISUALISATION HANDLING:

    // This function determines what data calculation functions to call
    // based on the 'active' map that's displayed.  And, then makes a
    // call to updateMap.  It reads/writes to globally-scoped vars in index.html
    function dataUpdateHandler(start, end) {
      if (activeMap == MAP_DIVS[0].id) {
        valueStartYear = start;
        valueEndYear = end;
        medianValueRates = calcValueRates(start, end, homeValues);
        updateMap(medianValueRates);
      } else if (activeMap == MAP_DIVS[1].id) {
        incomeStartYear = start;
        incomeEndYear = end;
        medianIncomeRates = calcIncomeRates(start, end, incomeValues);
        updateMap(medianIncomeRates);
      } else if (activeMap == MAP_DIVS[2].id) {
        combinedStartYear = start;
        combinedEndYear = end;
        combinedRates = calcCombinedRates(start, end, homeValues, incomeValues);
        updateMap(combinedRates);
      }
      //turn off loading animation
      showSpinner.value = false;
    }
    //Function Draws d3-map
    function drawMap() {
      // Define window dim vars
      const WIDTH = document.getElementById("d3-map").clientWidth;
      const HEIGHT = document.getElementById("d3-map").clientHeight;

      //Load the data as a Promise
      Promise.all([
        d3.json(US_COUNTIES),
        d3.csv(HOME_VALS),
        d3.csv(INCOMES),
      ]).then((data) => {
        // Init vars with data
        geoJsonCounties = data[0];
        homeValues = data[1];
        incomeValues = data[2];
        // Initialize each dict with every county's FIPS No., to be used as an index
        for (var key in homeValues[0]) {
          medianValueRates[key] = null;
          medianIncomeRates[key] = null;
          combinedRates[key] = null;
        }

        // CONSTRUCT D3 SVG:

        // Define the D3 projection, size, and geoPathGenerator
        const projection = d3
          .geoAlbers()
          .translate([WIDTH / 2, HEIGHT / 2 + mapPadding]) // center map
          .scale(WIDTH - WIDTH / 10); // set inital scale to screen width
        const geoPathGen = d3.geoPath().projection(projection);
        // Allow for D3 zooming
        const zoom = d3
          .zoom()
          .scaleExtent([1, 15]) // zoom scale limits
          .on("zoom", handleZoom); // on a zoom event, call handleZoom
        // tooltip will update their respective map's rate data
        const tooltip = d3.select("#tooltip");
        // Append a SVG element to each map display div
        var svg = d3
          .selectAll(
            "#" + MAP_DIVS[0].id + ",#" + MAP_DIVS[1].id + ",#" + MAP_DIVS[2].id
          )
          .append("svg")
          .attr("width", WIDTH - mapPadding)
          .attr("height", HEIGHT + HEIGHT / 4)
          .call(zoom);
        // Svg grouping element constant--path elements are appended to a group
        var g = svg.append("g");

        // Construct the SVG--append GEO data to "path" elements
        g.selectAll("path")
          .data(geoJsonCounties.features)
          .enter()
          .append("path")
          .attr("d", (d) => {
            return geoPathGen(d);
          })
          .on("mouseenter", (m, d) => {
            tooltip
              .transition()
              .delay(200)
              .style("display", "grid") // show tooltip (container is styled as grid-type display)
              .style("opacity", 0.9);
            tooltip
              .html(updateToolTip(d)) // Passes each path to updateToolTip func which return's tooltip's corresponding inner html
              .style("left", m.clientX - WIDTH / 2 + "px")
              .style("top", m.clientY + "px");
          })
          .on("mouseleave", (m, d) => {
            tooltip.transition().style("display", "none"); // hide tooltip displau
          });
        // CREATE / INITIALIZE ALL UI CONTROLS:
        /*
        // Create the map display toggle btns
        let toggleValueBtn = createToggleBtn(
          "control_overlay",
          "home_values",
          "Change in Home Values",
          toggleMap
        );
        let toggleIncomeBtn = createToggleBtn(
          "control_overlay",
          "incomes",
          "Change in Incomes",
          toggleMap
        );
        let toggleCombinedBtn = createToggleBtn(
          "control_overlay",
          "combined",
          "Housing Market Health",
          toggleMap
        );
        */

        // Create the date input range-sliders, add event listeners, & associated control-logic
        let dateSlider = dualSliderInput(
          "control_overlay",
          2010,
          2020,
          dataUpdateHandler
        );
        dateSlider[0].addEventListener("input", controlSlider);
        dateSlider[1].addEventListener("input", controlSlider);

        // INIT THE PAGE:

        // Inits the web-page upon its initial load w/default (hard-coded) date values
        function __init__(startYearDefault, endYearDefault) {
          for (var i = 0; i < Object.keys(MAP_DIVS).length; i++) {
            toggleMap(MAP_DIVS[i].id);
            dataUpdateHandler(startYearDefault, endYearDefault);
          }
          toggleMap(MAP_DIVS[0].id);
        }
        __init__(2010, 2020);
      });
    }
    return {
      drawMap,
      toggleMap,
      showHideSpinner,
      calcValueRates,
      calcIncomeRates,
      calcCombinedRates,
      updateMap,
      colorMap,
      handleZoom,
      dualSliderInput,
      controlSlider,
      updateTextBox,
      setSliderDates,
      createToggleBtn,
      styleActiveToggleBtn,
      updateLegend,
      homeValues,
      activeMap,
    };
  },
});
</script>
<style type="text/css">
/* CSS Reset for all browsers (prevents buggy padding) */
* {
  margin: 0;
  padding: 0;
  border: 0;
  outline: 0;
  font-size: 100%;
  vertical-align: baseline;
  background: transparent;
}
.container {
  position: relative;
}
.buttonText {
  font-family: "sans-serif";
  font-size: 12px;
}
.buttonSelected {
  color: gray;
}
.card-title {
  border-bottom: solid 1px black;
  letter-spacing: 1px;
  text-align: center;
  font-weight: bold;
  padding: 5px;
  font-family: "sans-serif";
}

/*---BODY STYLING---*/
/*-------------------------------*/
body {
  background-color: aliceblue;
}

/*---D3:SVG STYLING---*/
/*-------------------------------*/
div path {
  stroke-width: 0.3px;
  stroke: black;
  /* fill: none; --THIS WILL OVERRIDE D3 SVG "fill" ATTR COLORING*/
}

div path:hover {
  fill-opacity: 0.8;
  stroke-width: 2.5px;
  stroke: white;
}

/*---CONTROL OVERLAY STYLING---*/
/*-------------------------------*/
div#control_overlay {
  background-color: transparent;
  width: 100%;
  position: relative;
}

/*---TOGGLE BUTTONS STYLING---*/
/*----------------------------*/

div#control_overlay button {
  color: black;
  font-family: "Gill Sans";
  font-size: 20px;
  text-align: center;
  font-weight: bold;
  background-color: aliceblue;
  border: 5px outset white;
  border-radius: 10px;
  outline: 1px solid white;
  width: 225px;
  margin-left: 2%;
  padding: 5px;
}

div#control_overlay button:hover {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 1);
}

/*  click affect */
div#control_overlay button:active {
  box-shadow: 4px #667;
  transform: translateY(2px);
  opacity: 0.9;
}

/*---DATE-RANGE SLIDER STYLING---*/
/*-------------------------------*/
.range_slider {
  -webkit-appearance: none;
  width: 80%;
  background: transparent;
  border: 2px outset white;
  position: absolute;
  top: 25%;
  left: 10%;
  pointer-events: none;
  border-radius: 10px;
}

.range_slider::-webkit-slider-runnable-track {
  height: 15px;
  z-index: 1;
}

.range_slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  z-index: 3;
  height: 15px;
  width: 15px;
  border: 2px solid white;
  border-radius: 15px;
  background: gray;
  cursor: pointer;
  pointer-events: auto;
}

.range_slider::-webkit-slider-thumb:hover {
  background-color: white;
  box-shadow: 0px 4px 8px 0 rgba(0, 0, 0, 1);
}

.range_slider::-webkit-slider-thumb:active {
  background-color: white;
  box-shadow: 0px 4px 8px 0 rgba(0, 0, 0, 1);
}

.text_box {
  background-color: transparent;
  font-family: "Gill Sans";
  font-size: 12px;
  font-weight: bold;
  padding: 4px 8px 4px 8px;
  border: 2px solid white;
  border-radius: 5px;
}

/*---TOOLTIP STYLING---*/
/*-------------------------------*/

#tooltip {
  z-index: 3;
  width: fit-content;
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px;
  background: cornflowerblue;
  font-family: sans-serif;
  font-size: 100%;
  border: 5px outset steelblue;
  border-radius: 15px;
  line-height: 1;
  pointer-events: none;
  /* prevents tooltip from fluttering */
  display: none;
  grid-template-columns: repeat(8 / 1fr);
  grid-template-rows: auto;
}

#tooltip .p {
  font-weight: bold;
  grid-column: 1 / span 6;
  padding: 2px 0px 2px 0px;
}

#tooltip .v {
  margin-left: 10px;
  grid-column: 7 / span 2;
  padding: 2px 0px 2px 0px;
}

#tooltip #p {
  font-weight: bold;
  grid-column: 1 / span 2;
  padding: 2px 0px 2px 0px;
}

#tooltip #v_left {
  margin-left: 10px;
  grid-column: 4 / span 1;
  padding: 2px 0px 2px 0px;
}

#tooltip #v_right {
  margin-left: 10px;
  grid-column: 7 / span 1;
  padding: 2px 0px 2px 0px;
}

#tooltip #year {
  font-weight: bold;
  text-decoration: underline;
  grid-column: 5 / span 2;
  padding-top: 2px;
}

#tooltip #year_left {
  font-weight: bold;
  text-decoration: underline;
  grid-column: 4 / span 1;
  padding-top: 2px;
}

#tooltip #year_right {
  font-weight: bold;
  text-decoration: underline;
  grid-column: 7 / span 1;
  padding-top: 2px;
}

/*---LEGEND STYLING---*/
/*-------------------------------*/

#legend {
  width: 100%;
  position: relative;
  font-size: 18px;
  background: transparent;
  font-family: sans-serif;
}

#legend #a1 {
  font-weight: bold;
  letter-spacing: 1px;
  color: red;
  padding: 5px;
}

#legend #a2 {
  font-weight: bold;
  letter-spacing: 1px;
  color: blue;
  padding: 5px;
}
</style>
