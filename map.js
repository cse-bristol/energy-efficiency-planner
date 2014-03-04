"use strict";

/*global d3, topojson*/

var width = window.innerWidth - 400;
var height = window.innerHeight - 10;
var startCoordinates = [-3.0, 54.0];
var zoom = 15;

var projection = d3.geo.mercator()
    .center(startCoordinates);

var zoomer = d3.behavior.zoom()
    .scale(1 << zoom)
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

d3.select("#map")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.select("#map")
    .call(zoomer);

var m = "data/merged.json";

var layers = d3.map({
    //"example" : "data/example.json",
    //"subunits" : "data/uk.json", // TODO remove thius and put in national level boundaries
    //"Gov_Office_Region_DEC_2010_EN_Gen_Clip" : m,
    "County_Unitary_Auth_DEC_2012_EW_Gen_Clip" : m,
    //"Middle_Layer_SOA_2011_EW_Gen_Clip" : m,
    //"Lower_Layer_SOA_2011_EW_Gen_Clip" : m,
    //"Wards_DEC_2012_GB_Gen_Clip" : m
});

var loaded = d3.map();

layers.forEach(function(layerID, filePath){
    d3.json(filePath, function(error, data) {
	if (error) {
	    console.log("Couldn't load " + error);
	} else {
	    var shapes = data.objects[layerID];
	    var topojsonShapes = topojson.feature(data, shapes);
	    if (topojsonShapes.features) {
		topojsonShapes = topojsonShapes.features;
	    } else {
		topojsonShapes = [topojsonShapes];
	    }

	    loaded.set(layerID, topojsonShapes);
	    redraw();
	}
    });
});

layers.forEach(function(layerID, filePath){
    d3.select("svg").append("g")
	.attr("id", layerID)
	.attr("width", width)
	.attr("height", height);
});

var colour = function(){
    var colours = d3.scale.category20();

    return {
	/* Items next to each other in a list will get different colours. */
	byIndex : function(data, index) {
	    return colours(index);
	}
    };
}();

var select = function(event, index) {
    var properties = d3.map(event.properties).entries();

    var details = d3.select("#details ul");

    var regionProperties = details
        .selectAll("li")
        .data(properties);

    regionProperties.exit().remove();

    regionProperties.enter()
	.append("li")

    regionProperties.html(function(property) {
	return property.key + ": " + property.value;
    });
};

var redraw = function() {

    projection.scale(zoomer.scale() / 2 / Math.PI)
	.translate(zoomer.translate());
    
    loaded.forEach(function(layerID, topojsonShapes){
	var paths = d3.select("g#" + layerID)
	    .selectAll("path")
	    .data(topojsonShapes);
	paths.enter()
	    .append("path")
	    .attr("d", path)
	    .attr("fill", colour.byIndex)
	    .on("click", select);

	paths.attr("d", path);

    });
};

redraw();

zoomer.on("zoom", redraw);
