<script>
import {
  computed,
  defineComponent,
  onMounted,
  ref,
} from "@nuxtjs/composition-api";
import loadSpinner from "@/components/load_spinner.vue";
import * as d3 from "d3";

export default defineComponent({
  name: "Map",
  components: { loadSpinner },
  setup() {
    // const array contains html div ID names containing each map (SVG)
    const MAP_DIVS = document.getElementsByClassName("map");
    // Init vars to keep track of the actively displayed div (SVG) and corresponding map data
    var activeMap = null;
    // Vars used to specifcy the specific years retrieve housing/income data
    var valueStartYear = 2020;
    var valueEndYear = 2020;
    var incomeStartYear = 2020;
    var incomeEndYear = 2020;
    var combinedStartYear = 2020;
    var combinedEndYear = 2020;
    // Dictionaries which will hold re-calculated (home,income,health) data values for each county
    // These are what's used used to fill/re-color each SVG map
    var medianValueRates = {};
    var medianIncomeRates = {};
    var combinedRates = {};
    var activeRateData = {};

    // define geo json & csv file(s)
    const US_COUNTIES = "./us_counties_geo.json";
    const HOME_VALS = "./median_house_values.csv";
    const INCOMES = "./median_incomes.csv";
    let showSpinner = ref(true);
    let showHideSpinner = computed(() => {
      return showSpinner.value;
    });
    onMounted(() => {
      drawMap();
    });

    // Define toggle map btn controls--changes the 'active' map div
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
      // Function calls to change style of active toggle button and re-color active map
      styleActiveToggleBtn();
    }

    // Passes slider values as arguments to to controlSlider Func
    function setSliderDates(start, end) {
      controlSlider(start, end);
    }

    // Additional slider control logic--
    // Repositions sliders during a page toggle &
    // ensures both sliders control as a single dual slider
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
      // update the slider text box divs to display the years
      updateTextBox(s1.value, s2.value);
    }

    // Updates the date slider's text boxes with their input value
    function updateTextBox(value1, value2) {
      let textBox1 = document.getElementById("t1");
      let textBox2 = document.getElementById("t2");
      textBox1.innerHTML = value1;
      textBox2.innerHTML = value2;
    }
    // Get toggle btns and assign them to array, then restyle their colors
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

    //Draw map
    function drawMap() {
      // define window dim vars
      const WIDTH = document.getElementById("d3-map").clientWidth;
      const HEIGHT = document.getElementById("d3-map").clientHeight;

      // Load the data as a promise
      Promise.all([
        d3.json(US_COUNTIES),
        d3.csv(HOME_VALS),
        d3.csv(INCOMES),
      ]).then((data) => {
        // Constants to store each set of imported data after files are loaded
        const geoJsonCounties = data[0];
        const homeValues = data[1];
        const incomeValues = data[2];

        // Initialize each dict with every county's FIPS No., to be used as an index
        for (var key in homeValues[0]) {
          medianValueRates[key] = null;
          medianIncomeRates[key] = null;
          combinedRates[key] = null;
        }
        // Define the D3 projection, size, and scale constants and geoPathGenerator
        const projection = d3
          .geoAlbers()
          .translate([WIDTH / 2, HEIGHT]) // center map
          .scale(WIDTH); // set inital scale to screen width
        const geoPathGen = d3.geoPath().projection(projection);
        // Allow for D3 zooming
        const zoom = d3
          .zoom()
          .scaleExtent([1, 15]) // zoom scale limits
          .on("zoom", handleZoom); // on a zoom event, call handleZoom
        // each of these will update their respective map's rate data
        const tooltip = d3.select("#tooltip");
        // D3 coloring interpolation using previously defined coloring scale - uses D3 Red-to-Blue coloring Scheme
        var colorInterpolator = d3.interpolateRdBu;
        // Tool tip html.  Slightly different display of data, depending on
        // whether or not the start and end year is the same
        function updateToolTip(d) {
          var toolTipData = "";
          var rateProperty = "";
          var numProperty = "";
          var startYear = "";
          var endYear = "";
          var activeRateData = {};
          if (activeMap == MAP_DIVS[0].id) {
            rateProperty = "Change in Median Home Value:";
            numProperty = "Median Home Value:";
            startYear = valueStartYear;
            endYear = valueEndYear;
            activeRateData = medianValueRates;
          } else if (activeMap == MAP_DIVS[1].id) {
            rateProperty = "Change in Median Income:";
            numProperty = "Median Income:";
            startYear = incomeStartYear;
            endYear = incomeEndYear;
            activeRateData = medianIncomeRates;
          } else if (activeMap == MAP_DIVS[2].id) {
            rateProperty = "Apprx. Housing Market Inflation:";
            startYear = combinedStartYear;
            endYear = combinedEndYear;
            for (var key in combinedRates) {
              activeRateData[key] = combinedRates[key] * -1;
            }
          }
          if (startYear == endYear) {
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
              '<div id="year">Year: ' +
              String(startYear) +
              "</div>" +
              '<div class="p">' +
              rateProperty +
              "</div>" +
              '<div class="v">' +
              String(activeRateData[d.properties["GEO_ID"]].toFixed(2)) +
              " %</div>" +
              '<div class="p">' +
              numProperty +
              "</div>" +
              '<div class="v">' +
              "hello" +
              "</div>";
          } else {
            toolTipData =
              '<div id="property1">County / Municipality:' +
              "</div>" +
              '<div id="value1">' +
              d.properties["NAME"] +
              "</div>" +
              '<div id="property2">State / Territory:' +
              "</div>" +
              '<div id="value2">' +
              d.properties["STATE_NAME"] +
              "</div>" +
              '<div id="propert3y">' +
              rateProperty +
              "</div>" +
              '<div id="value3">' +
              String(activeRateData[d.properties["GEO_ID"]].toFixed(2)) +
              " %</div>";
          }

          return toolTipData;
        }

        // Append a SVG element to each map display div
        var svg = d3
          .selectAll(
            "#" + MAP_DIVS[0].id + ",#" + MAP_DIVS[1].id + ",#" + MAP_DIVS[2].id
          )
          .append("svg")
          .attr("width", WIDTH)
          .attr("height", HEIGHT * 2)
          .call(zoom);
        // Svg grouping element constant--path elements are appended to a group
        var g = svg.append("g");
        // Build the SVG w/ tooltip feature
        // Append geo data and "path" elements to construct initial map SVGs.
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
              .style("display", "grid")
              .style("opacity", 0.9);
            tooltip
              .html(updateToolTip(d)) // Passes each path to updateToolTip which returns html to populate
              .style("left", m.clientX + "px")
              .style("top", m.clientY + "px");
          })
          .on("mouseleave", (m, d) => {
            tooltip.transition().style("display", "none");
          });

        // Function will update the % change in median home values between two dates for all counties
        function calcValueRates(start, end) {
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
        function calcIncomeRates(start, end) {
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
          console.log("Income:", rates);
          return rates;
        }

        // Function will determine the housing market health between two dates by
        // comparing change over time of median home price-to-income ratios for all counties
        function calcCombinedRates(start, end) {
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

        function dataUpdateHandler(start, end) {
          if (activeMap == MAP_DIVS[0].id) {
            valueStartYear = start;
            valueEndYear = end;
            medianValueRates = calcValueRates(start, end);
            updateMap(medianValueRates);
          } else if (activeMap == MAP_DIVS[1].id) {
            incomeStartYear = start;
            incomeEndYear = end;
            medianIncomeRates = calcIncomeRates(start, end);
            updateMap(medianIncomeRates);
          } else if (activeMap == MAP_DIVS[2].id) {
            console.log("ran");
            combinedStartYear = start;
            combinedEndYear = end;
            combinedRates = calcCombinedRates(start, end);
            updateMap(combinedRates);
          }
        }

        // Function updates global start & end year vars (set by range slider cntrls)
        // Then makes a call to updateMap(), which makes calls to updateData and colorMap
        function changeYears(start, end) {
          dataUpdateHandler(start, end);
        }
        // colorMap, will first make a call to the updateDataHandler to refresh the data it needs to re-color
        function updateMap(rateData) {
          // Take extent of new data range
          var extent = d3.extent(Object.values(rateData));
          console.log(extent);
          // Update coloring scale based on the new data
          var sorted = Object.values(rateData).sort(d3.ascending);
          sorted.map((d) => {
            return d.toFixed(2);
          });
          console.log(sorted);
          let scale = d3
            .scaleDiverging()
            .domain([extent[0], 0, extent[1]], (d) => {
              //a min to max scale with '0' value is nuetral
              return d;
            });
          // Color the map
          colorMap(scale, rateData);
        }

        function colorMap(scale, rateData) {
          console.log("Coloring");
          // Color (fill) the map
          d3.selectAll("#" + activeMap + " path").attr("fill", (d) => {
            for (var key in rateData) {
              if (d.properties["GEO_ID"] == key) {
                //console.log(d.properties["NAME"] + ": " + rateData[key]);
                return colorInterpolator(scale(rateData[key]));
              }
            }
            //loading screen
            showSpinner.value = false;
          });
        }

        function handleZoom(e) {
          d3.select("#" + activeMap + " svg g").attr("transform", e.transform);
        }

        // USER INTERFACE CONTROL FUNCTION DEFINITIONS:

        // Define function to create toggle map btns
        function createToggleBtn(
          parentDiv,
          divControlled,
          btnText,
          toggleFunc
        ) {
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

        // Create the map display toggle btns
        //using v-btn for toggle

        /* let toggleValueBtn = createToggleBtn(
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

        // Define function to create Date range slider control input
        function dualSliderInput(div, min, max, changeYears) {
          // Create single dual-input range slider made of two normal sliders
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
          var t1 = document.createElement("div");
          var t2 = document.createElement("div");
          t1.classList.add("text_box1");
          t2.classList.add("text_box2");
          t1.id = "t1";
          t2.id = "t2";
          // Add functionality to sliders
          s1.onmouseup = function () {
            changeYears(s1.value, s2.value);
          };
          s2.onmouseup = function () {
            changeYears(s1.value, s2.value);
          };
          // append everything to the parent (control) div in the right order
          document.getElementById(div).appendChild(t1);
          document.getElementById(div).appendChild(s2);
          document.getElementById(div).appendChild(s1);
          document.getElementById(div).appendChild(t2);
          return [s1, s2, t1, t2];
        }

        // Create the date input range-sliders
        let dateSlider = dualSliderInput(
          "control_overlay",
          2010,
          2020,
          changeYears
        );
        // Add event listeners & their associated control logic
        dateSlider[0].addEventListener("input", controlSlider);
        dateSlider[1].addEventListener("input", controlSlider);

        // Init the page upon initial load
        function initPage(startYearDefault, endYearDefault) {
          for (var i = 0; i < Object.keys(MAP_DIVS).length; i++) {
            toggleMap(MAP_DIVS[i].id);
            dataUpdateHandler(startYearDefault, endYearDefault);
          }
          toggleMap(MAP_DIVS[0].id);
        }
        // Init default pages with 2020 as start and end year
        initPage(2020, 2020);
      });
    }
    return {
      drawMap,
      toggleMap,
      showHideSpinner,
    };
  },
});
</script>

<template>
  <div>
    <v-row class="pa-5">
      <v-col cols="4">
        <v-card outlined class="menu">
          <v-card-title class="card-title">Years of Interest</v-card-title>
          <v-container class="container">
            <div id="control_overlay"></div>
          </v-container>
          <v-card-text class="pa-3"> </v-card-text>
        </v-card>
        <v-card outlined class="menu">
          <v-card-title class="card-title">Display</v-card-title>
          <div class="pa-3" style="text-align: center">
            <v-btn outlined class="button" @click="toggleMap('incomes')">
              <span class="buttonText">Incomes</span></v-btn
            >
            <v-btn outlined class="button" @click="toggleMap('home_values')"
              ><span class="buttonText">House Prices</span></v-btn
            >
            <v-btn outlined class="button" @click="toggleMap('combined')"
              ><span class="buttonText"> Market Health </span></v-btn
            >
          </div>
        </v-card>
      </v-col>
      <v-col style="text-align: center" id="d3-map" cols="6">
        <v-container class="container">
          <load-spinner v-if="showHideSpinner" />
          <div id="home_values" class="map"></div>
          <div id="incomes" class="map"></div>
          <div id="combined" class="map"></div>
        </v-container>
        <div id="tooltip"></div>
      </v-col>
    </v-row>
  </div>
</template>
<style scoped type="text/css">
.container {
  position: relative;
}

.buttonText {
  font-family: "Gill Sans";
  font-size: 12px;
}
.card-title {
  font-family: "Gill Sans";
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
  width: 100%;
  position: relative;
  text-align: center;
  padding: 5px;
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

.text_box1 {
  width: 10%;
  right: 32%;
  position: relative;
  background-color: transparent;
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  font-family: "Gill Sans";
  border: 2px solid white;
  border-style: outset;
  border-radius: 10px;
  display: inline-block;
}
.text_box2 {
  width: 10%;
  left: 32%;
  position: relative;
  background-color: transparent;
  color: white;
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  font-family: "Gill Sans";
  border: 2px solid white;
  border-style: outset;
  border-radius: 10px;
  display: inline-block;
}

#t2 {
  margin-left: 18%;
}

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
  border: 5px outset gray;
  border-radius: 11px;
  line-height: 1;
  top: 0;
  left: 0;
  pointer-events: none; /* prevents tooltip from fluttering */
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

#tooltip #year {
  font-weight: bold;
  border-bottom: 2px solid black;
  grid-column: 4 / span 2;
  padding-top: 2px;
}
</style>
