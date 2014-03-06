"use strict";

/*global d3, topojson*/

var width = window.innerWidth - 400;
var height = window.innerHeight - 10;
var templeMeads = [-2.5806295, 51.4496909];
var startCoordinates = templeMeads;
var zoom = 23;

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

var layersByFile = d3.map({});
var loaded = d3.map({});

var loadManifest = function(error, data) {
    if (error) {
	console.log("Couldn't load manifest " + error);
    }
    
    d3.map(data).entries().forEach(function(entry) {
	if (layersByFile.has(entry.value)) {
	    layersByFile.get(entry.value).append(entry.key);
	} else {
	    layersByFile.set(entry.value, [entry.key]);
	}
    });

    layersByFile.forEach(function(file, layers){
	var loadFile = function(error, data) {
	    if (error) {
		console.log("Couldn't load file " + file + " " + error);
	    }

	    layers.forEach(function(l){
		d3.select("svg").append("g")
		    .attr("id", l)
		    .attr("width", width)
		    .attr("height", height);
		
		var shapes = data.objects[l + "_All_Phases"]; // HACK HACK HACK
		var topojsonShapes = topojson.feature(data, shapes);
		if (topojsonShapes.features) {
		    topojsonShapes = topojsonShapes.features;
		} else {
		    topojsonShapes = [topojsonShapes];
		}

		loaded.set(l, topojsonShapes);
		redraw();
	    });
	};

	d3.json(file, loadFile);
    });
};

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
	.append("li");

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

d3.json("data/processed/manifest.json", loadManifest);
redraw();
zoomer.on("zoom", redraw);
