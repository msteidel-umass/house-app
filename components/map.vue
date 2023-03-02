<template>
	<div>
		<v-row pa-5>
			<v-col cols="2">	
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
				<v-container class="container" id="map-container">
					<load-spinner v-if="false" />
					<v-col id="home_values" class="map">
						<v-row>
							<div id="main-map"></div>
						</v-row>
						<v-row>
							<div id="alaska-map"></div>
							<div id="hawaii-map"></div>
							<div id="puerto-rico-map"></div>
						</v-row>
					</v-col>
					<v-col id="incomes" class="map">
						<v-row>
							<div id="main-map"></div>
						</v-row>
						<v-row>
							<div id="alaska-map"></div>
							<div id="hawaii-map"></div>
							<div id="puerto-rico-map"></div>
						</v-row>
					</v-col>
					<v-col id="combined" class="map">
						<v-row>
							<div id="main-map"></div>
						</v-row>
						<v-row>
							<div id="alaska-map"></div>
							<div id="hawaii-map"></div>
							<div id="puerto-rico-map"></div>
						</v-row>
					</v-col>
				</v-container>
			</v-col>
			<load-spinner v-if="false" />
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
import * as d3 from "d3";

export default defineComponent({
	name: "Map",
	components: { loadSpinner },
	setup() {
		// Define geo json & csv file(s)
		const US_COUNTIES = "/GeoJson/Country/contiguous_us_counties_geo.json";
		const US_STATES = "/GeoJson/Country/contiguous_us_states_geo.json";

		const ALASKA = "/GeoJson/States/alaska_geo.json";
		const HAWAII = "/GeoJson/States/hawaii_geo.json";
		const PUERTO_RICO = "/GeoJson/States/puerto_rico_geo.json";

		const AL_COUNTIES = "/GeoJson/States/alabama_counties_geo.json";
		const AK_COUNTIES = "/GeoJson/States/alaska_counties_geo.json";
		const AZ_COUNTIES = "/GeoJson/States/arizona_counties_geo.json";
		const AR_COUNTIES = "/GeoJson/States/arkansas_counties_geo.json";
		const CA_COUNTIES = "/GeoJson/States/california_counties_geo.json";
		const CO_COUNTIES = "/GeoJson/States/colorado_counties_geo.json";
		const CT_COUNTIES = "/GeoJson/States/connecticut_counties_geo.json";
		const DE_COUNTIES = "/GeoJson/States/delaware_counties_geo.json";
		const FL_COUNTIES = "/GeoJson/States/florida_counties_geo.json";
		const GA_COUNTIES = "/GeoJson/States/georgia_counties_geo.json";
		const HI_COUNTIES = "/GeoJson/States/hawaii_counties_geo.json";
		const ID_COUNTIES = "/GeoJson/States/idaho_counties_geo.json";
		const IL_COUNTIES = "/GeoJson/States/illinois_counties_geo.json";
		const IN_COUNTIES = "/GeoJson/States/indiana_counties_geo.json";
		const IA_COUNTIES = "/GeoJson/States/iowa_counties_geo.json";
		const KS_COUNTIES = "/GeoJson/States/kansas_counties_geo.json";
		const KY_COUNTIES = "/GeoJson/States/kentucky_counties_geo.json";
		const LA_COUNTIES = "/GeoJson/States/louisiana_counties_geo.json";
		const ME_COUNTIES = "/GeoJson/States/maine_counties_geo.json";
		const MD_COUNTIES = "/GeoJson/States/maryland_counties_geo.json";
		const MA_COUNTIES = "/GeoJson/States/massachusetts_counties_geo.json";
		const MI_COUNTIES = "/GeoJson/States/michigan_counties_geo.json";
		const MN_COUNTIES = "/GeoJson/States/minnesota_counties_geo.json";
		const MS_COUNTIES = "/GeoJson/States/mississippi_counties_geo.json";
		const MO_COUNTIES = "/GeoJson/States/missouri_counties_geo.json";
		const MT_COUNTIES = "/GeoJson/States/montana_counties_geo.json";
		const NE_COUNTIES = "/GeoJson/States/nebraska_counties_geo.json";
		const NV_COUNTIES = "/GeoJson/States/nevada_counties_geo.json";
		const NH_COUNTIES = "/GeoJson/States/new_hampshire_counties_geo.json";
		const NJ_COUNTIES = "/GeoJson/States/new_jersey_counties_geo.json";
		const NM_COUNTIES = "/GeoJson/States/new_mexico_counties_geo.json";
		const NY_COUNTIES = "/GeoJson/States/new_york_counties_geo.json";
		const NC_COUNTIES = "/GeoJson/States/north_carolina_counties_geo.json";
		const ND_COUNTIES = "/GeoJson/States/north_dakota_counties_geo.json";
		const OH_COUNTIES = "/GeoJson/States/ohio_counties_geo.json";
		const OK_COUNTIES = "/GeoJson/States/oklahoma_counties_geo.json";
		const OR_COUNTIES = "/GeoJson/States/oregon_counties_geo.json";
		const PA_COUNTIES = "/GeoJson/States/pennsylvania_counties_geo.json";
		const RI_COUNTIES = "/GeoJson/States/rhode_island_counties_geo.json";
		const SC_COUNTIES = "/GeoJson/States/south_carolina_counties_geo.json";
		const SD_COUNTIES = "/GeoJson/States/south_dakota_counties_geo.json";
		const TN_COUNTIES = "/GeoJson/States/tennessee_counties_geo.json";
		const TX_COUNTIES = "/GeoJson/States/texas_counties_geo.json";
		const UT_COUNTIES = "/GeoJson/States/utah_counties_geo.json";
		const VT_COUNTIES = "/GeoJson/States/vermont_counties_geo.json";
		const VA_COUNTIES = "/GeoJson/States/virginia_counties_geo.json";
		const WA_COUNTIES = "/GeoJson/States/washington_counties_geo.json";
		const WV_COUNTIES = "/GeoJson/States/west_virginia_counties_geo.json";
		const WI_COUNTIES = "/GeoJson/States/wisconsin_counties_geo.json";
		const WY_COUNTIES = "/GeoJson/States/wyoming_counties_geo.json";

		const DC = "/GeoJson/States/district_of_columbia_geo.json";
		const PR_COUNTIES = "/GeoJson/States/puerto_rico_counties_geo.json"

		const HOME_VALS = "/CSV/median_house_values.csv";
		const INCOMES = "/CSV/median_incomes.csv";
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
			

			Promise.resolve()
			.then(() => drawMap(US_STATES, "main-map"))
			.then(() => drawMap(ALASKA, "alaska-map"))
			.then(() => drawMap(HAWAII, "hawaii-map"))
			.then(() => drawMap(PUERTO_RICO, "puerto-rico-map"));
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
			//console.log(activeMap);
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
			d3.select("#" + activeMap + " svg g");//.attr("transform", e.transform);
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
		function drawMap(inputGeoJson, divId) {
			// Define window dim vars

			if(divId == "main-map"){
				var width = document.getElementById("d3-map").clientWidth;
				var height = document.getElementById("d3-map").clientHeight;
			} else {
				var width = document.getElementById("d3-map").clientWidth/3.5;
				var height = document.getElementById("d3-map").clientHeight/3.5;
			}

			//Load the data as a Promise
			Promise.all([
				d3.json(inputGeoJson),
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

				var center = d3.geoCentroid(geoJsonCounties);
				var scale   = (width < height) ? width : height;
				var offset = [width/2, height/2];

				// CONSTRUCT D3 SVG:

				// Define the D3 projection, size, and geoPathGenerator
				var projection = d3
					.geoMercator()
					.center(center)
					.scale(1.3*scale)
	 				.translate(offset);
				var geoPathGen = d3.geoPath().projection(projection);

				var bounds = geoPathGen.bounds(geoJsonCounties);
				var hscale = scale*width / (bounds[1][0] - bounds[0][0]);
				var vscale  = scale*height / (bounds[1][1] - bounds[0][1]);
				scale   = (hscale < vscale) ? hscale : vscale;
				offset  = [width - (bounds[0][0] + bounds[1][0])/2, height - (bounds[0][1] + bounds[1][1])/2];

				projection = d3
					.geoMercator()
					.center(center)
					.scale(scale)
					.translate(offset);

					geoPathGen = geoPathGen.projection(projection);

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
						"#" + divId
					)
					.append("svg")
					.attr("width", width)
					.attr("height", height)
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
							.style("left", m.clientX + "px")
							.style("top", m.clientY + "px");
					})
					.on("mouseleave", (m, d) => {
						tooltip.transition().style("display", "none"); // hide tooltip displau
					})
					.on("click", (m, d) => {
						switch(d.properties["NAME"]) {
							case "Alabama":
								d3.selectAll("svg").remove();
								drawMap(AL_COUNTIES, "main-map");
								break;
							case "Alaska":
								d3.selectAll("svg").remove();
								drawMap(AK_COUNTIES, "main-map");
								break;
							case "Arkansas":
								d3.selectAll("svg").remove();
								drawMap(AR_COUNTIES, "main-map");
								break;
							case "Arizona":
								d3.selectAll("svg").remove();
								drawMap(AZ_COUNTIES, "main-map");
								break;
							case "California":
								d3.selectAll("svg").remove();
								drawMap(CA_COUNTIES, "main-map");
								break;
							case "Colorado":
								d3.selectAll("svg").remove();
								drawMap(CO_COUNTIES, "main-map");
								break;
							case "Connecticut":
								d3.selectAll("svg").remove();
								drawMap(CT_COUNTIES, "main-map");
								break;
							case "Delaware":
								d3.selectAll("svg").remove();
								drawMap(DE_COUNTIES, "main-map");
								break;
							case "District of Columbia":
								d3.selectAll("svg").remove();
								drawMap(DC, "main-map");
								break;
							case "Florida":
								d3.selectAll("svg").remove();
								drawMap(FL_COUNTIES, "main-map");
								break;
							case "Georgia":
								d3.selectAll("svg").remove();
								drawMap(GA_COUNTIES, "main-map");
								break;
							case "Hawaii":
								d3.selectAll("svg").remove();
								drawMap(HI_COUNTIES, "main-map");
								break;
							case "Idaho":
								d3.selectAll("svg").remove();
								drawMap(ID_COUNTIES, "main-map");
								break;
							case "Illinois":
								d3.selectAll("svg").remove();
								drawMap(IL_COUNTIES, "main-map");
								break;
							case "Indiana":
								d3.selectAll("svg").remove();
								drawMap(IN_COUNTIES, "main-map");
								break;
							case "Iowa":
								d3.selectAll("svg").remove();
								drawMap(IA_COUNTIES, "main-map");
								break;
							case "Kansas":
								d3.selectAll("svg").remove();
								drawMap(KS_COUNTIES, "main-map");
								break;
							case "Kentucky":
								d3.selectAll("svg").remove();
								drawMap(KY_COUNTIES, "main-map");
								break;
							case "Louisiana":
								d3.selectAll("svg").remove();
								drawMap(LA_COUNTIES, "main-map");
								break;
							case "Maine":
								d3.selectAll("svg").remove();
								drawMap(ME_COUNTIES, "main-map");
								break;
							case "Maryland":
								d3.selectAll("svg").remove();
								drawMap(MD_COUNTIES, "main-map");
								break;
							case "Massachusetts":
								d3.selectAll("svg").remove();
								drawMap(MA_COUNTIES, "main-map");
								break;
							case "Michigan":
								d3.selectAll("svg").remove();
								drawMap(MI_COUNTIES, "main-map");
								break;
							case "Minnesota":
								d3.selectAll("svg").remove();
								drawMap(MN_COUNTIES, "main-map");
								break;
							case "Mississippi":
								d3.selectAll("svg").remove();
								drawMap(MS_COUNTIES, "main-map");
								break;
							case "Missouri":
								d3.selectAll("svg").remove();
								drawMap(MO_COUNTIES, "main-map");
								break;
							case "Montana":
								d3.selectAll("svg").remove();
								drawMap(MT_COUNTIES, "main-map");
								break;
							case "Nebraska":
								d3.selectAll("svg").remove();
								drawMap(NE_COUNTIES, "main-map");
								break;
							case "Nevada":
								d3.selectAll("svg").remove();
								drawMap(NV_COUNTIES, "main-map");
								break;
							case "New Hampshire":
								d3.selectAll("svg").remove();
								drawMap(NH_COUNTIES, "main-map");
								break;
							case "New Jersey":
								d3.selectAll("svg").remove();
								drawMap(NJ_COUNTIES, "main-map");
								break;
							case "New Mexico":
								d3.selectAll("svg").remove();
								drawMap(NM_COUNTIES, "main-map");
								break;
							case "New York":
								d3.selectAll("svg").remove();
								drawMap(NY_COUNTIES, "main-map");
								break;
							case "North Carolina":
								d3.selectAll("svg").remove();
								drawMap(NC_COUNTIES, "main-map");
								break;
							case "North Dakota":
								d3.selectAll("svg").remove();
								drawMap(ND_COUNTIES, "main-map");
								break;
							case "Ohio":
								d3.selectAll("svg").remove();
								drawMap(OH_COUNTIES, "main-map");
								break;
							case "Oklahoma":
								d3.selectAll("svg").remove();
								drawMap(OK_COUNTIES, "main-map");
								break;
							case "Oregon":
								d3.selectAll("svg").remove();
								drawMap(OR_COUNTIES, "main-map");
								break;
							case "Pennsylvania":
								d3.selectAll("svg").remove();
								drawMap(PA_COUNTIES, "main-map");
								break;
							case "Puerto Rico":
								d3.selectAll("svg").remove();
								drawMap(PR_COUNTIES, "main-map");
								break;
							case "Rhode Island":
								d3.selectAll("svg").remove();
								drawMap(RI_COUNTIES, "main-map");
								break;
							case "South Carolina":
								d3.selectAll("svg").remove();
								drawMap(SC_COUNTIES, "main-map");
								break;
							case "South Dakota":
								d3.selectAll("svg").remove();
								drawMap(SD_COUNTIES, "main-map");
								break;
							case "Tennessee":
								d3.selectAll("svg").remove();
								drawMap(TN_COUNTIES, "main-map");
								break;
							case "Texas":
								d3.selectAll("svg").remove();
								drawMap(TX_COUNTIES, "main-map");
								break;
							case "Utah":
								d3.selectAll("svg").remove();
								drawMap(UT_COUNTIES, "main-map");
								break;
							case "Vermont":
								d3.selectAll("svg").remove();
								drawMap(VT_COUNTIES, "main-map");
								break;
							case "Virginia":
								d3.selectAll("svg").remove();
								drawMap(VA_COUNTIES, "main-map");
								break;
							case "Washington":
								d3.selectAll("svg").remove();
								drawMap(WA_COUNTIES, "main-map");
								break;
							case "West Virginia":
								d3.selectAll("svg").remove();
								drawMap(WV_COUNTIES, "main-map");
								break;
							case "Wisconsin":
								d3.selectAll("svg").remove();
								drawMap(WI_COUNTIES, "main-map");
								break;
							case "Wyoming":
								d3.selectAll("svg").remove();
								drawMap(WY_COUNTIES, "main-map");
								break;
							default:
						}
					})

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

		function drawGraphs() {

		}
		return {
			drawGraphs,
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