"use strict";

/*global module, require*/

/*
 This file is where all the mess and wiring goes.
 We should aim to reduce its size.
*/

var log2 = function(n) {
    return Math.log(n) / Math.LN2;
    
};
var zoomToLayer = function(l) {
    if (l.boundingbox()) {
	var x1 = l.boundingbox()[0],
	    y1 = l.boundingbox()[1],
	    x2 = l.boundingbox()[2],
	    y2 = l.boundingbox()[3];

	var boxSize = Math.max(
	    Math.abs(x1 - x2),
	    Math.abs(y1 - y2));

	var newZoom = Math.round(
	    log2(360 / boxSize) + 1.5);
	console.log("new zoom " + newZoom);
	console.log("new bounds " + [(y1 + y2) / 2, (x1 + x2) / 2]);
	
	map.setView(
	    leaflet.latLng(
		(y1 + y2) / 2,
		(x1 + x2) / 2),	    
	    newZoom);
    }
};

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

    baseLayers = require("./base-layers.js")(errors),
    title = require("./title.js")(body),
    transform = d3.geo.transform({point: projectPoint});

require("leaflet-fancy-layer-control");
require("./lib/d3-plugins/geo/tile/tile.js");

var nationalHeatMap = leaflet.tileLayer('http://test-tiles.0d9303a4.cdn.memsites.com/Total%20Heat%20Density/Z{z}/{y}/{x}.png', {
    attribution: '<a href="http://tools.decc.gov.uk/nationalheatmap/">English National Heat Map</a>,',
    minZoom: 2,
    maxZoom: 17
}),
    
    map = new leaflet.Map("map", {
	doubleClickZoom: false
    })
	.addLayer(baseLayers.default())
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

var layerOpacity = leaflet.Control.Layers.Opacity(),
    layerOrder = leaflet.Control.Layers.Order(),
    layerDelete = leaflet.Control.Layers.Delete(map, undefined, function(layer) {
	layers.remove(layer);
    }),
    layerSelect = require("./layer-select.js")(leaflet, zoomToLayer, layers, selection, getLayerObjects, function(layer, name, overlay) {
	return layers.get(name) !== undefined;
    }),
    
    layersControl = new leaflet.Control.Layers.Extensible(
	baseLayers.dict,
	{
	    "National Heat Map" : nationalHeatMap
	},
	{
	    hooks : [layerOpacity],
	    baseHooks : [],
	    overlayHooks : [layerOrder, layerDelete, layerSelect]
	});

layersControl.addTo(map);
layers.layerCreated(function(l){
    map.addLayer(l);
    layersControl.addOverlay(l, l.name());
});

var paint = require("./paint.js")(overlay, transform, sortedByZ);
layerOpacity.opacityChanged(paint.redrawAll);

layerOrder.orderChanged(function(){
    paint.redrawAll();
    paintDisplayColumn();
});

var worksheet = require("./worksheet.js")(
	worksheetContainer,
	layers, 
	sources, 
	errors),
    resultsTable = require("./results-table.js")(worksheetContainer.content()),
    colour = require("./colour.js"),
    calculationsDisplay = require("./calculations-display.js")(worksheetContainer.content());

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
    function(layer) {
	zoomToLayer(layer);
	selection.select(getLayerObjects(layer.name()), false);
    }, 
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
    calculationsDisplay.update(worksheet.sources());
    paintDisplayColumn();
});

var wikiStore = require("./wiki-store.js")(
    errors, 
    body, 
    toolbar,
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

require("./query-string.js")(map, layersControl, baseLayers, wikiStore, title, errors);
