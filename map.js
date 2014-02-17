"use strict";

/*global d3, topojson*/

var tileScale = 256;
var width = Math.max(960, window.innerWidth) - 10;
var height = Math.max(500, window.innerHeight) - 10;
var startCoordinates = [-3.0, 54.0];
var zoom = 15;

var tiler = d3.geo.tile()
	.size([width, height]);

var projection = d3.geo.mercator()
	.center(startCoordinates);

var zoomer = d3.behavior.zoom()
	.scale(1 << zoom)
	.translate([width / 2, height / 2]);

var path = d3.geo.path()
	.projection(projection);

d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

d3.select("body")
    .call(zoomer);

var roads = d3.select("svg").append("g")
	.attr("id", "roads")
	.attr("width", width)
	.attr("height", height);

var tileURL = function(d) {
    var x = d[0];
    var y = d[1];
    var zoom = d[2];
    return "http://tile.openstreetmap.us/vectiles-highroad/" + zoom + "/" + x + "/" + y + ".json";
};

var layers = d3.map({
    //"data/example.json": "example",
    "data/uk.json" : "subunits", // TODO remove thius and put in national level boundaries
    //"data/Gov_Office_Region_DEC_2010_EN_Gen_Clip.json" : "Gov_Office_Region_DEC_2010_EN_Gen_Clip",
    //"data/County_Unitary_Auth_DEC_2012_EW_Gen_Clip.json" : "County_Unitary_Auth_DEC_2012_EW_Gen_Clip",
    "data/Middle_Layer_SOA_2011_EW_Gen_Clip.json" : "Middle_Layer_SOA_2011_EW_Gen_Clip"
    //"data/Lower_Layer_SOA_2011_EW_Gen_Clip.json" : "Lower_Layer_SOA_2011_EW_Gen_Clip"
    //"data/Wards_DEC_2012_GB_Gen_Clip.json" : "Wards_DEC_2012_GB_Gen_Clip"
});

var loaded = d3.map();

layers.forEach(function(filePath, layerID){
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

layers.forEach(function(filePath, layerID){
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
	    .attr("fill", colour.byIndex);

	paths.attr("d", path);

    });
};

redraw();
zoomer.on("zoom", redraw);
