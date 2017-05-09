/////////////////////////////////////
// Step 1: Write accessor functions //
//////////////////////////////////////


function x(d) {
    // Return immigrant percentage
    return d.immigrants / d.population;
}
function y(d) {
    // Return unemployment rate
    console.log(d.unemployment);
    return d.unemployment;
}
function radius(d) {
    // Return state's population
    return d.population;
}
function key(d) {
    // Return state's name
    return d.state;
}

// Positions the dots based on data.
function position(dot) {
  dot.attr("cx", function(d) { return xScale(x(d)); })
    .attr("cy", function(d) { return yScale(y(d)); })
    .attr("r", function(d) { return radiusScale(radius(d)); });
}

function positionVoronoi(voronoiGrid) {
  voronoiGrid.attr("points", function(d){
      return d.map(function(pt){
        return pt[0].toString() + "," + pt[1].toString()
      }).join(" ");
    });
}

// Defines a sort order so that the smallest dots are drawn on top.
function order(a, b) {
  return radius(b) - radius(a);
}

//////////////
// Provided //
//////////////

// Chart dimensions
var margin = {top: 19.5, right: 19.5, bottom: 19.5, left: 39.5};
var width = 960 - margin.right;
var height = 500 - margin.top - margin.bottom;

colors = [];
for(var i = 0; i <= 50; i++){
  colors.push(d3.interpolateRainbow(i / 50.0));
}

// Various scales
var xScale = d3.scaleLinear().domain([0, 0.3]).range([0, width]),
    yScale = d3.scaleLinear().domain([0, 0.3]).range([height, 0]),
    radiusScale = d3.scaleSqrt().domain([0, 40000000]).range([0, 40]),
    colorScale = d3.scaleOrdinal(colors);

// The x & y axes
var xAxis = d3.axisBottom(xScale).tickFormat(d3.format(".0%"));
    yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".1%"));

// Create the SVG container and set the origin
var svg = d3.select("#chart").append("svg")
    .attr("width", width + margin.left + margin.right + 300)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//////////////////////////////
// Step 2: Add x and y axes //
//////////////////////////////
svg.append("g").attr("class", "axis").attr("transform", "translate(0," + height + ")").call(xAxis);
svg.append("g").attr("class", "axis").call(yAxis);

//////////////////////////////////////
// Step 3: Add axis and year labels //
//////////////////////////////////////
svg.append("text")
  .attr("class", "x label")
  .attr("x", width)
  .attr("y", height - 5)
  .attr("text-anchor", "end")
  .text("immigrant percentage of population");

svg.append("text")
  .attr("class", "y label")
  .attr("x", 14)
  .attr("y", 0)
  .attr("transform", "rotate(270, 14, 0)")
  .attr("text-anchor", "end")
  .text("unemployment rate");

var yearLabel = svg.append("text")
  .attr("class", "year label")
  .attr("x", width)
  .attr("y", 145)
  .attr("text-anchor", "end")
  .text("1990");

var tooltip = svg.append("g")
  .attr("class", "tooltip")
  .attr("transform", "translate(" + (width + 25) + ",0)");

tooltip.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 275)
  .attr("height", 155)
  .attr("fill", "lightgrey");

tooltip.append("text")
  .attr("class", "tooltitle")
  .attr("x", 30)
  .attr("y", 30)
  .text("State Information");

tooltip.append("text")
  .attr("class", "stateinfo")
  .attr("x", 8)
  .attr("y", 60)
  .text("Hover to show more info.");

///////////////////////////
// Step 4: Load the data //
///////////////////////////

// Load the data.
d3.json("../data/unem_vs_imm.json", function(states) {

  /////////////////////////////////////////
  // Functions provided for your utility //
  /////////////////////////////////////////

  // Interpolates the dataset for the given (fractional) year.
  function interpolateData(year) {
    return states.map(function(d) {
      return {
        state: d.state,
        immigrants: interpolateValues(d.immigrants, year),
        unemployment: interpolateValues(d.unemployment, year),
        population: interpolateValues(d.population, year)
      };
    });
  }

  function interpolateValues(values, year) {
    return values.filter(function(val){ return val[0] == year; })[0][1];
  }

  ///////////////////////
  // Step 4: Plot dots //
  ///////////////////////

  // Add a dot per state. Initialize the data at 1990, and set the colors.
  var dot = svg.append("g").attr("class", "dot")
    .selectAll(".datapoint").data(interpolateData(1990)).enter()
    .append("circle").attr("class", "datapoint")
    .call(position)
    .attr("fill", function(d) { return colorScale(key(d)); })
    .sort(order);

  ///////////////////////////////////
  // Step 5: Add fluff and overlay //
  ///////////////////////////////////

  // Add a title. -- Not needed anymore since we're doing voronoi tooltips
  dot.append("title").text(key);

  // Voronoi //
  var voronoi = d3.voronoi()
    .x(function(d) { return xScale(x(d)); } )
    .y(function(d) { return yScale(y(d)); })
    .extent([[0, 0], [width, height]]);

  var voronoiGrid = svg.append("g")
    .attr("class", "voronoi").selectAll("polygon")
    .data(voronoi.polygons(interpolateData(1990)))
    .enter().append("polygon")
    .call(positionVoronoi)
    .attr("fill", "none")
    .on("mouseover", showTooltip)
    .on("mouseout", removeTooltip);

  function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function showTooltip(d){
    if (yearLabel.classed("active")){
      // doing interaction, don't show tooltip
      removeTooltip();
    } else {
      svg.selectAll(".stateinfo").remove();
      svg.append("circle").attr("class", "indicator")
      .attr("cx", xScale(x(d['data'])))
      .attr("cy", yScale(y(d['data'])))
      .attr("r", radiusScale(radius(d['data'])))
      .attr("fill", "yellow");

      tooltip.append("text")
        .attr("class", "stateinfo")
        .attr("x", 8)
        .attr("y", 60)
        .text("State: " + key(d['data']) + " (" + yearLabel.text() + ")");

      tooltip.append("text")
        .attr("class", "stateinfo")
        .attr("x", 8)
        .attr("y", 85)
        .text("Population: " + numberWithCommas(Math.round(radius(d['data']))));

      tooltip.append("text")
        .attr("class", "stateinfo")
        .attr("x", 8)
        .attr("y", 110)
        .text("Immigrant population: " + numberWithCommas(d['data'].immigrants));
    }
  }

  function removeTooltip(){
    svg.selectAll(".indicator").remove();
    svg.selectAll(".stateinfo").remove();
    tooltip.append("text")
        .attr("class", "stateinfo")
        .attr("x", 8)
        .attr("y", 60)
        .text("Hover to show more info.");
  }

  // Add an overlay for the year label.
  var box = yearLabel.node().getBBox();

  var overlay = svg.append("rect")
    .attr("class", "overlay").attr("x", box.x).attr("y", box.y)
    .attr("width", box.width).attr("height", box.height)
    .on("mouseover", enableInteraction);

  ////////////////////////
  // Step 6: Transition //
  ////////////////////////

  // Start a transition that interpolates the data based on year.
  svg.transition()
      .duration(15000)
      .ease(d3.easeLinear)
      .tween("year", tweenYear)
      .on("end", enableInteraction);

  // After the transition finishes, you can mouseover to change the year.
  function enableInteraction() {
    // Create a year scale
    yearScale = d3.scaleLinear().domain([box.x, box.x + box.width]).range([1990, 2014]);
    // Cancel the current transition, if any.
    svg.transition();

    // For the year overlay, add mouseover, mouseout, and mousemove events
    // that 1) toggle the active class on mouseover and out and 2)
    // change the displayed year on mousemove.

    overlay
        .on("mouseover", mouseover)
        .on("mouseout", mouseout)
        .on("mousemove", mousemove)
        .on("touchmove", mousemove);

    function mouseover() {
      yearLabel.classed("active", true);
    }

    function mouseout() {
      yearLabel.classed("active", false);
    }

    function mousemove() {
      newYear = Math.round(yearScale(d3.mouse(this)[0]));
      yearLabel.text(newYear);
      data = interpolateData(newYear);
      dot.data(data, key).call(position).sort(order);
      voronoiGrid.data(voronoi.polygons(data)).call(positionVoronoi);
    }
  }

  // Tweens the entire chart by first tweening the year, and then the data.
  // For the interpolated data, the dots and label are redrawn.
  function tweenYear() {
    var year = d3.interpolateNumber(1990, 2014); // create a closure on interpolation of year
    return function(t) {
      currYear = Math.round(year(t));
      yearLabel.text(currYear);
      data = interpolateData(currYear);
      dot.data(data, key).call(position).sort(order);
      voronoiGrid.data(voronoi.polygons(data)).call(positionVoronoi);
    };
  }
});
