"use strict";

/*global d3, topojson*/

var width = window.innerWidth - 400;
var height = window.innerHeight - 10;
var templeMeads = [-2.5806295, 51.4496909];
var startCoordinates = templeMeads;
var zoom = 23;
var date = 2013;

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

var layersByShapeFile = d3.map({});
var properties = d3.map({});
var shapes = d3.map({});
var selection = d3.map({});

var loadManifest = function(error, data) {
    if (error) {
	console.log("Couldn't load manifest " + error);
    }
    
    var queueLoadLayer = function(file, layerID) {
	if (layersByShapeFile.has(file)) {
	    layersByShapeFile.get(file).push(layerID);
	} else {
	    layersByShapeFile.set(file, [layerID]);
	}
    };

    var queueLoadData = function(file, layerID, prop) {
	d3.tsv(file, function(error, rows) {
	    if (!properties.has(layerID)) {
		properties.set(layerID, d3.map({}));
	    }

	    properties.get(layerID).set(prop, rows);
	});
    };
    
    d3.map(data).entries().forEach(function(geometryLayer) {
	var props = d3.map(geometryLayer.value);

	props.entries().forEach(function(entry){
	    var prop = entry.key;
	    var file = entry.value;

	    if (prop === "shape") {
		queueLoadLayer(file, geometryLayer.key);
	    } else {
		queueLoadData(file, geometryLayer.key, prop);
	    }
	});
    });

    layersByShapeFile.forEach(function(file, layers){
	var loadFile = function(error, data) {
	    if (error) {
		console.log("Couldn't load file " + file + " " + error);
	    }

	    layers.forEach(function(l){
		d3.select("svg").append("g")
		    .attr("id", l)
		    .attr("width", width)
		    .attr("height", height);
		
		var s = data.objects[l];
		var topojsonShapes = topojson.feature(data, s);
		if (topojsonShapes.features) {
		    topojsonShapes = topojsonShapes.features;
		} else {
		    topojsonShapes = [topojsonShapes];
		}

		shapes.set(l, topojsonShapes);
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


var updateSelection = function() {
    var details = d3.select("#details");
    
    var ul = details.selectAll("#details ul")
	    .data(selection.values());

    ul.enter().append("ul");
    ul.exit().remove();

    
    var li = ul.selectAll("li")
    	    .data(function(d) {
    		return d;
    	    });

    li.enter().append("li");
    li.exit().remove();
    li.html(function(property) {
    	return property.key + ": " + property.value;
    });
};

var select = function(event, index) {
    var areaProp = d3.map(event.properties).entries();

    var target = d3.select(this);
    
    var isSelected = target.classed("selected");

    if (isSelected) {
	target.classed("selected", false);
	selection.remove(event.properties.Name);	
    } else {
	target.classed("selected", true);
	selection.set(event.properties.Name, areaProp);
    }

    updateSelection();
};

var redraw = function() {

    projection.scale(zoomer.scale() / 2 / Math.PI)
	.translate(zoomer.translate());
    
    shapes.forEach(function(layerID, topojsonShapes){
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
