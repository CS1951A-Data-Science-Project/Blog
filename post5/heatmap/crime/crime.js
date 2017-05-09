var width = 960;
var height = 500;
var offset = 50; 

// D3 Projection
var projection = d3.geo.albersUsa()
           .translate([width/2, height/2 + offset])    
           .scale([1000]);         

// Define path generator
var path = d3.geo.path()              
         .projection(projection);  


// Define linear scale for output
var color_scale = d3.scale.linear()
    .range(['rgb(206, 192, 197)','rgb(44, 66, 204)']);    

// make svg and append map 
var svg1 = d3.select("#heatmap1")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

// title 
svg1.append("text")
  .attr("x", 200)
  .attr("y", offset)
  .attr("font-family", "sans-serif")
  .attr("font-size", "20px")
  .attr("fill", "#3f3f3f")
  .text("Heatmap of Correlation Between Crime Rate & Immigration"); 


// tooltip 
var div = d3.select("#heatmap1")
        .append("div")   
        .attr("class", "tooltip")               
        .style("opacity", 0);

// load data 
d3.csv("heatmap/crime/imm_crime_corr_state.csv", function(data) {
  color_scale.domain([-1, 1]); 

  // Load GeoJSON data 
  d3.json("heatmap/unem/us-states.json", function(json) {

      // Loop through each state data value in the .csv file
      for (var i = 0; i < data.length; i++) {

        // Grab State Name
        var dataState = data[i].State;

        // Grab data value
        var dataCorr = data[i].Corr;

        // Find the corresponding state inside the GeoJSON
        for (var j = 0; j < json.features.length; j++)  {
          var jsonState = json.features[j].properties.name;

          if (dataState == jsonState) {

          // Copy the data value into the JSON
          json.features[j].properties.corr = dataCorr;

          // Stop looking through the JSON
          break;
          }
        }
      }

    // Bind the data to the SVG and create one path per GeoJSON feature
    svg1.selectAll("path")
      .data(json.features)
      .enter()
      .append("path")
      .attr("d", path)
      .style("stroke", "#fff")
      .style("stroke-width", "1")
      .style("fill", function(d) {
        var corr = d.properties.corr;

        if (corr) 
          return color_scale(corr);
        else 
          return "rgb(209, 222, 255)";
        
      })

    // tooltip appear on mouse over 
    .on("mouseover", function(d) {      
        div.transition()        
             .duration(200)      
             .style("opacity", .9);  
          var corr = Math.round(d.properties.corr  * 100) / 100
          var text = d.properties.name + ":\n" + corr   
          div.text(text)
             .style("left", (d3.event.pageX) + "px")     
             .style("top", (d3.event.pageY - 28) + "px");    
    })   

      // fade out tooltip on mouse out               
      .on("mouseout", function(d) {       
          div.transition()        
             .duration(200)      
             .style("opacity", 0);   
      });

// linear gradient for legend 
var RECT = d3.select("#heatmap1").append("svg")
  .attr("width", 140)
    .attr("height", 180)
  .attr("class", "legend")

var gradient = svg1.append("defs")
    .append("linearGradient")
    .attr("id", "gradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%")
    .attr("spreadMethod", "pad");

gradient.append("stop")
    .attr("offset", "0%")
    .attr("stop-color", "rgb(44, 66, 204)")
    .attr("stop-opacity", 1);

gradient.append("stop")
    .attr("offset", "100%")
    .attr("stop-color", "rgb(206, 192, 197)")
    .attr("stop-opacity", 1);

RECT.append("rect")
  .attr("x", 10)
  .attr("y", 24)
    .attr("width", 18)
    .attr("height", 100)
    .style("fill", "url(#gradient)");

var labelScale = d3.scale.linear().domain([-1, 1]).range([100, 0]); 
var labels = d3.svg1.axis().scale(labelScale).ticks(4).orient("right");

RECT.append("g")
    .attr("class", "y axis")
  .attr("transform","translate(28,24)")
  .call(labels); 

RECT.append("text")
  .attr("x", 5)
  .attr("y", 10)
  .text("Correlation"); 

  });

});