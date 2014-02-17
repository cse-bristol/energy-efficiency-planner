"use strict";

/*global d3, topojson*/

var tileScale = 256;
var width = Math.max(960, window.innerWidth) - 10;
var height = Math.max(500, window.innerHeight) - 10;
var startCoordinates = [-2.5833, 51.4500];
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
    "data/uk.json" : "subunits",
    //"data/Gov_Office_Region_DEC_2010_EN_Gen_Clip.json" : "Gov_Office_Region_DEC_2010_EN_Gen_Clip",
    //"data/County_Unitary_Auth_DEC_2012_EW_Gen_Clip.json" : "County_Unitary_Auth_DEC_2012_EW_Gen_Clip",
    //"data/Middle_Layer_SOA_2011_EW_Gen_Clip.json" : "Middle_Layer_SOA_2011_EW_Gen_Clip",
    //"data/Lower_Layer_SOA_2011_EW_Gen_Clip.json" : "Lower_Layer_SOA_2011_EW_Gen_Clip",
    "data/Wards_DEC_2012_GB_Gen_Clip.json" : "Wards_DEC_2012_GB_Gen_Clip",
});

layers.forEach(function(k, v){
    d3.select("svg").append("g")
	.attr("id", v)
	.attr("width", width)
	.attr("height", height);
});

var redraw = function() {

    projection.scale(zoomer.scale() / 2 / Math.PI)
	.translate(zoomer.translate());

    // var drawTile = function(tileData) {
    // 	var onTileLoad = function(error, json) {
    // 	    var pieces = g.selectAll("path")
    // 		    .data(json.features.sort(function(a, b){
    // 			return a.properties.sort_key - b.properties.sort_key;
    // 		    }));

    // 	    pieces.exit().remove();

    // 	    pieces.enter()
    // 		.append("path")
    // 		.attr("class", function(d){return d.properties.kind;})
    // 		.attr("d", path);
    // 	};

    // 	var g = d3.select(this);
    // 	d3.json(tileURL(tileData), onTileLoad);
    // };

    // var tiles = roads.selectAll("g")
    // 	.data(tiler
    // 	      .scale(projection.scale() * 2 * Math.PI)
    // 	      .translate(projection([0, 0])));
    // tiles.enter()
    // 	.append("g")
    // 	.attr("class", "tile")
    // 	.each(drawTile);
    
    // tiles.exit().remove();
    
    layers.forEach(function(k, v){
	d3.json(k, function(error, data) {
	    if (error) {
		console.log("Couldn't load " + error);
	    } else {
		var shapes = data.objects[v];
		var topojsonShapes = topojson.feature(data, shapes);
		if (topojsonShapes.features) {
		    topojsonShapes = topojsonShapes.features;
		} else {
		    topojsonShapes = [topojsonShapes];
		}

		var paths = d3.select("g#" + v)
		    .selectAll("path")
		    .data(topojsonShapes);
		paths.enter()
		    .append("path")
		    .attr("d", path);

		paths.attr("d", path);

	    }
	});
    });
};

redraw();
zoomer.on("zoom", redraw);
