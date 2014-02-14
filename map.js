"use strict";

/*global d3, topojson*/

var tileScale = 256;
var width = Math.max(960, window.innerWidth) - 10;
var height = Math.max(500, window.innerHeight) - 10;
var startCoordinates = [-2.5833, 51.4500];
var zoom = 18;

d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

var tiler = d3.geo.tile()
    .size([width, height]);

var projection = d3.geo.mercator()
    .center(startCoordinates)
    .translate([width / 2, height / 2])
    .scale((1 << zoom) / 2 / Math.PI);

var path = d3.geo.path()
    .projection(projection);

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
    //    "data/Gov_Office_Region_DEC_2010_EN_Gen_Clip.json" : "Gov_Office_Region_DEC_2010_EN_Gen_Clip",
    //    "data/County_Unitary_Auth_DEC_2012_EW_Gen_Clip.json" : "County_Unitary_Auth_DEC_2012_EW_Gen_Clip",
    "data/uk.json" : "subunits"
});

layers.forEach(function(k, v){
    d3.select("svg").append("g")
	.attr("id", v)
	.attr("width", width)
	.attr("height", height)
});

var drawMap = function() {

    var drawTile = function(tileData) {
    	var onTileLoad = function(error, json) {
    	    g.selectAll("path")
    		.data(json.features.sort(function(a, b){
    		    return a.properties.sort_key - b.properties.sort_key;
    		}))
    		.enter()
    		.append("path")
    		.attr("class", function(d){return d.properties.kind;})
    		.attr("d", path);
    	};

    	var g = d3.select(this);
    	d3.json(tileURL(tileData), onTileLoad);
    };

    roads.selectAll("g")
    	.data(tiler
    	      .scale(projection.scale() * 2 * Math.PI)
    	      .translate(projection([0, 0])))
    	.enter()
    	.append("g")
    	.attr("class", "tile")
    	.each(drawTile);
    
    layers.forEach(function(k, v){
	d3.json(k, function(error, data) {
	    var shapes = data.objects[v];

	    d3.select("g#" + v).append("path")
		.datum(topojson.feature(data, shapes))
		.attr("d", path);
	});
    });
};

drawMap();
