<script>
import { defineComponent, onMounted, ref } from "@nuxtjs/composition-api";
import Slider from "./slider.vue";
import * as d3 from "d3";

export default defineComponent({
  name: "Map",
  components: { Slider },
  setup() {
    onMounted(() => {
      const toolbarHeight = 250;
      const getWidth = ref(window.innerWidth / 2);
      const getHeight = ref(window.innerHeight);

      /*  This visualization was made possible by modifying code provided by:

      Scott Murray, Choropleth example from "Interactive Data Visualization for the Web" 
      https://github.com/alignedleft/d3-book/blob/master/chapter_12/05_choropleth.html   
		
      Malcolm Maclean, tooltips example tutorial
      http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html

      Mike Bostock, Pie Chart Legend
      http://bl.ocks.org/mbostock/3888852  */

      //Width and height of map
      var width = getWidth.value;
      var height = getHeight.value - toolbarHeight;
      console.log("width");
      console.log(width);
      console.log("height");
      console.log(height);

      // D3 Projection
      var projection = d3.geo
        .albersUsa()
        .translate([width / 2, height / 2]) // translate to center of screen
        .scale([1200]); // scale things down so see entire US

      // Define path generator
      var path = d3.geo
        .path() // path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use albersUsa projection

      // Define linear scale for output
      var color = d3.scale
        .linear()
        .range([
          "rgb(213,222,217)",
          "rgb(69,173,168)",
          "rgb(84,36,55)",
          "rgb(217,91,67)",
        ]);

      var legendText = [
        "Cities Lived",
        "States Lived",
        "States Visited",
        "Nada",
      ];

      //Create SVG element and append map to the SVG
      var svg = d3
        .select("#map")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

      // Append Div for tooltip to SVG
      var div = d3
        .select("#map")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

      // Load in my states data!
      d3.csv("/stateslived.csv", function (data) {
        color.domain([0, 1, 2, 3]); // setting the range of the input data

        // Load GeoJSON data and merge with states data
        d3.json("/us-states.json", function (json) {
          // Loop through each state data value in the .csv file
          for (var i = 0; i < data.length; i++) {
            // Grab State Name
            var dataState = data[i].state;

            // Grab data value
            var dataValue = data[i].visited;

            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < json.features.length; j++) {
              var jsonState = json.features[j].properties.name;

              if (dataState == jsonState) {
                // Copy the data value into the JSON
                json.features[j].properties.visited = dataValue;

                // Stop looking through the JSON
                break;
              }
            }
          }

          // Bind the data to the SVG and create one path per GeoJSON feature
          svg
            .selectAll("path")
            .data(json.features)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", "#fff")
            .style("stroke-width", "1")
            .style("fill", function (d) {
              // Get data value
              var value = d.properties.visited;

              if (value) {
                //If value exists…
                return color(value);
              } else {
                //If value is undefined…
                return "rgb(213,222,217)";
              }
            });

          // Map the cities I have lived in!
          d3.csv("/cities-lived.csv", function (data) {
            svg
              .selectAll("circle")
              .data(data)
              .enter()
              .append("circle")
              .attr("cx", function (d) {
                return projection([d.lon, d.lat])[0];
              })
              .attr("cy", function (d) {
                return projection([d.lon, d.lat])[1];
              })
              .attr("r", function (d) {
                return Math.sqrt(d.years) * 4;
              })
              .style("fill", "rgb(217,91,67)")
              .style("opacity", 0.85)

              // Modification of custom tooltip code provided by Malcolm Maclean, "D3 Tips and Tricks"
              // http://www.d3noob.org/2013/01/adding-tooltips-to-d3js-graph.html
              .on("mouseover", function (d) {
                div.transition().duration(200).style("opacity", 0.9);
                div
                  .text(d.place)
                  .style("left", d3.event.pageX + "px")
                  .style("top", d3.event.pageY - 28 + "px");
              })

              // fade out tooltip on mouse out
              .on("mouseout", function (d) {
                div.transition().duration(500).style("opacity", 0);
              });
          });

          //Median House values Data
          d3.csv("/median_house_values.csv", function (data) {
            console.log("Median House Price Data:::");
            console.log(data);
          });

          //Median Income by States Data
          d3.csv("/median_house_values.csv", function (data) {
            console.log("Median Income Data:::");
            console.log(data);
          });

          // Modified Legend Code from Mike Bostock: http://bl.ocks.org/mbostock/3888852
          var legend = d3
            .select("#map")
            .append("svg")
            .attr("class", "legend")
            .attr("width", 100)
            .attr("height", 100)
            .attr("transform", "translate(" + 0 + "," + height / 2 + ")")
            .selectAll("g")
            .data(color.domain().slice().reverse())
            .enter()
            .append("g")
            .attr("transform", function (d, i) {
              return "translate(0," + i * 20 + ")";
            });

          legend
            .append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color);

          legend
            .append("text")
            .data(legendText)
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function (d) {
              return d;
            });
        });
      });
    });
  },
});
</script>

<template>
  <div>
    <v-row class="pa-5">
      <v-col cols="3">
        <v-card outlined class="menu">
          <v-card-title>Years of Interest</v-card-title>
          <v-card-text class="pa-3">
            <p>Start Year:<Slider /></p>
            <p>End Year:<Slider /></p>
          </v-card-text>
        </v-card>
        <v-card outlined class="menu">
          <v-card-title>Display</v-card-title>
          <v-card-actions class="pl-3">
            <div>
              <v-btn outlined class="button"
                ><span class="buttonText">Inflation</span></v-btn
              >
              <v-btn outlined class="button"
                ><span class="buttonText">House Increase</span></v-btn
              >
              <v-btn outlined class="button"
                ><span class="buttonText"> Market Health </span></v-btn
              >
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col>
        <div style="text-align: center" id="map"></div>
      </v-col>
    </v-row>
  </div>
</template>
<style type="text/css">
/* On mouse hover, lighten state color */
path:hover {
  fill-opacity: 0.7;
}

/* Style for Custom Tooltip */
div.tooltip {
  position: absolute;
  width: 60px;
  height: 28px;
  padding: 2px;
  font: 12px sans-serif;
  background: white;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
}

/* Legend Font Style */
#map {
  font: 11px sans-serif;
}

/* Legend Position Style */
.legend {
  position: absolute;
  border: solid;
  color: white;
  background: gray;
}
.menu {
  margin-bottom: 10px;
  padding: 2px;
  border: 1px;
}
.button {
  margin-left: 2px;
  height: 40px;
  width: 32%;
}
.buttonText {
  font-size: 10px;
}
</style>
