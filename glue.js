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

var paintDisplayColumn = function() {
    var displayData = worksheet.displayData(time.current());
    colour.paintSVGElements(displayData, selection.current());

    colour.unpaintHTML(resultsTable.cells());
    if (worksheet.getSortProperties().properties.length > 0) {
	colour.paintHTMLSelection(displayData, resultsTable.column(worksheet.propertyIndex(
	    worksheet.getSortProperties().properties[0])));
    }
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

    worksheetOpenClose = toolbar.append("span")
	.html("⊞"),
    worksheetContainer = dialogue(
	body.append("div").attr("id", "worksheet"))
	.resize()
	.close()
	.open(worksheetOpenClose)
	.drag(),

    errors = require("./errors.js")(body, toolbar),
    time = require("./time-control.js")(body, toolbar, 2013, 2024, 2014),
    loader = require("./loader.js"),
    sources = require("./sources.js")(errors),
    layers = require("./layers.js")(errors, sources),
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

var overlay = d3.select(map.getPanes().overlayPane)
	.select("svg")
	.attr("id", "overlay"),

    selection = require("./selection.js")(overlay);

map.addControl(new geocoder({
    email: "research@cse.org.uk"
}));

var layersControl = require("./layer-control.js")(body, toolbar, map, layers, function(layerName) {
    selection.select(getLayerObjects(layerName), false);
});

layers.layerCreated(function(l){
    layersControl.update();
});

var paint = require("./paint.js")(overlay, transform, sortedByZ);

var worksheet = require("./worksheet.js")(
	worksheetContainer,
	layers, 
	sources, 
	errors),
    resultsTable = require("./results-table.js")(worksheetContainer.content()),
    colour = require("./colour.js");

sources.onSourceLoad(worksheet.addSource);

layers.layerChanged(function(l){
    if (!l.enabled) {
	selection.deselect(getLayerObjects(l.name()));
    }
    paint.redrawAll();
});
layers.layerRemoved(function(l){
    selection.deselect(getLayerObjects(l.name()));    
    paint.redrawAll();
});

paint.addClickHandler(selection.clickHandler);

map.on("viewreset", paint.redrawAll);

selection.addCallback(function(values, entering, leaving){
    colour.unpaint(leaving);
    worksheet.selectionChanged(values, entering, leaving);
});

var handlers = require("./file-handlers.js")(
    errors, 
    geometries, 
    layers, 
    sources, 
    paint.redrawAll
);
require("./file-drop.js")(d3.select("body"), errors, handlers);

resultsTable.headerClicked(function(h){
    worksheet.sortProperty(h, d3.event.shiftKey);
});
resultsTable.rowClicked(function(head, row){
    var shape = d3.select("g#" + row[0] + " path#" + row[1]);
    selection.select(shape, d3.event.shiftKey);
});

time.onChange(worksheet.timeChanged);

worksheet.dataChanged(function(){
    resultsTable.info(worksheet.propertyNames(), worksheet.allData(time.current()), worksheet.getSortProperties());
    paintDisplayColumn();
});

var wikiStore = require("./wiki-store.js")(
    errors, 
    body,
    toolbar,
    map,
    layersControl,
    layers,
    worksheet,
    selection,
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
