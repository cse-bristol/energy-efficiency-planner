"use strict";

/*global d3*/

var tileScale = 256;
var width = Math.max(960, window.innerWidth);
var height = Math.max(500, window.innerHeight);
var startCoordinates = [-2.5833, 51.4500];

var tiler = d3.geo.tile()
	.size([width, height]);

var projection = d3.geo.mercator()
	.center(startCoordinates)
	.translate([width / 2, height / 2])
	.scale((1 << 19) / 2 / Math.PI);

var path = d3.geo.path()
	.projection(projection);



/*var zoom = d3.behavior.zoom()
	.scale(projection.scale() * 2 * Math.PI)
	.translate(projection(startCoordinates).map(function(x) { return -x; }))
	.on("zoom", drawMap);*/

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);
//	.call(zoom);

var tileURL = function(d) {
    var x = d[0];
    var y = d[1];
    var zoom = d[2];
    return "http://tile.openstreetmap.us/vectiles-highroad/" + zoom + "/" + x + "/" + y + ".json";
};

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

    svg.selectAll("g")
	.data(tiler
	      .scale(projection.scale() * 2 * Math.PI)
	      .translate(projection([0, 0])))
	.enter()
	.append("g")
	.attr("class", "tile")
	.each(drawTile);

};

drawMap();
