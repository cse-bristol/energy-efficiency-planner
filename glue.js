"use strict";

/*global module, require*/

/*
 This file is where all the mess and wiring goes.
 We should aim to reduce its size.
*/

var projectPoint = function(x, y) {
    var point = map.latLngToLayerPoint(new leaflet.LatLng(y, x));
    this.stream.point(point.x, point.y);
};

var sortedByZ = function() {
    return layers.enabled().slice(0).sort(function(a, b){
	return a.options.zIndex - b.options.zIndex;
    });
};

var getLayerObjects = function(layerName) {
    return d3.select("#map svg g#" + layerName)
	.selectAll("path");
};

var startCoordinates = [0, 0],
    zoom = 2,
    d3 = require("d3"),
    dialogue = require("floating-dialogue"),
    geocoder = require("leaflet-control-geocoder"),
    leaflet = require("leaflet"),

    body = d3.select("body"),
    mapDiv = body.append("div").attr("id", "map"),
    toolbar = body.append("div").attr("id", "toolbar"),
    errors = require("./errors.js")(body, toolbar),
    time = require("./time-control.js")(body, toolbar, 2013, 2024, 2014),
    loader = require("./loader.js"),
    layers = require("./layers.js")(errors),
    geometries = require("./geometries.js"),

    title = require("./title.js")(body),
    transform = d3.geo.transform({point: projectPoint});

require("./lib/d3-plugins/geo/tile/tile.js");

var map = new leaflet.Map("map", {
    doubleClickZoom: false
})
	.setView(startCoordinates, zoom);

/* The map will make us an svg. It will automatically sort out its bounds for us. */
map._initPathRoot();

map.addControl(new geocoder({
    email: "research@cse.org.uk"
}));

var overlay = d3.select(map.getPanes().overlayPane)
	.select("svg")
	.attr("id", "overlay"),

    layersControl = require("./layer-control.js")(body, toolbar, map, layers),
    paint = require("./paint.js")(overlay, transform, sortedByZ),
    worksheet = require("./worksheet.js")(),
    resultsTable = require("./results-table.js");

layers.layerCreated(function(l) {
    l.worksheet = worksheet(l.geometry());
    l.worksheet.baseColourChanged(paint.redrawAll);

    l.resultsTable = resultsTable(body);
    l.resultsTable.headerClicked(function(p) {
	    l.worksheet.sortProperty(p, d3.event.shiftKey);
	});

    l.worksheet.sortPropertyChanged(function() {
	l.resultsTable.info(
	    l.worksheet.headers(), 
	    l.worksheet.data(),
	    l.worksheet.getSortProperties());
    });

    l.resultsTable.info(
	l.worksheet.headers(), 
	l.worksheet.data(),
	l.worksheet.getSortProperties());
    layersControl.update();
});
layers.layerChanged(function(l) {
    l.resultsTable.info(
	l.worksheet.headers(), 
	l.worksheet.data(),
	l.worksheet.getSortProperties());
    paint.redrawAll();
});
layers.layerRemoved(function(l) {
    l.resultsTable.remove();
    paint.redrawAll();
});

map.on("viewreset", paint.redrawAll);

var handlers = require("./file-handlers.js")(
    errors, 
    geometries, 
    layers, 
    paint.redrawAll
);
require("./file-drop.js")(d3.select("body"), errors, handlers);

var wikiStore = require("./wiki-store.js")(
    errors, 
    body,
    toolbar,
    map,
    layersControl,
    layers,
    title,
    function findShapesByName(names) {
	return d3.selectAll("#map svg g path")
	    .filter(function(d, i) {
		return names.has(d.layer.name() + "/" + d.id);
	    });
    },
    paint.redrawAll
);

require("./query-string.js")(wikiStore, title);
