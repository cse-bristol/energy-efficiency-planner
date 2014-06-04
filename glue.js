"use strict";

/*global d3, L, OpenDataMap*/

var startCoordinates = [0, 0];
var zoom = 2;
var manifestFile = "data/processed/manifest.json";

var errors = OpenDataMap.errors(d3.select("#messages"));

var time = OpenDataMap.timeControl(d3.select("#time-control"), 2013, 2024, 2013);
var loader = OpenDataMap.loader();
var sources = OpenDataMap.sources(errors);
var layers = OpenDataMap.layers(errors, sources);
var geometries = OpenDataMap.geometries();
var handlers = OpenDataMap.file.handlers(errors, geometries, layers, sources);

var osmLayer = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
});
var Stamen_TonerBackground = L.tileLayer('http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20
});
var Esri_WorldShadedRelief = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
    maxZoom: 13
});
var Esri_WorldImagery = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});
var nationalHeatMap = L.tileLayer('http://test-tiles.0d9303a4.cdn.memsites.com/Total%20Heat%20Density/Z{z}/{y}/{x}.png', {
    attribution: '<a href="http://tools.decc.gov.uk/nationalheatmap/">National Heat Map</a>,',
    minZoom: 2,
    maxZoom: 17
});


var map = new L.Map("map")
	.addLayer(osmLayer)
	.setView(startCoordinates, zoom);

map.on('layerremove', function(event){
    layers.remove(event.layer);
});

var overlay = d3.select(map.getPanes().overlayPane)
	.append("svg")
	.attr("id", "overlay");

map.addControl(new L.Control.OSMGeocoder({
    email: "research@cse.org.uk"
}));

var layerOpacity = L.Control.Layers.Opacity();
var layerOrder = L.Control.Layers.Order();
var layerDelete = L.Control.Layers.Delete(map);
var layersControl = new L.Control.Layers.Extensible(
    {
	"Open Street Map" : osmLayer,
	"Stamen Toner" : Stamen_TonerBackground,
	"ESRI Relief": Esri_WorldShadedRelief,
	"ESRI World Imagery" : Esri_WorldImagery
    },
    {
	"National Heat Map" : nationalHeatMap
    },
    {
	hooks : [layerDelete, layerOpacity],
	baseHooks : [],
	overlayHooks : [layerOrder]
    });

layersControl.addTo(map);
layers.layerCreated(function(l){
    map.addLayer(l);
    layersControl.addOverlay(l, l.name());
});

var projectPoint = function(x, y) {
    var point = map.latLngToLayerPoint(new L.LatLng(y, x));
    this.stream.point(point.x, point.y);
};
var transform = d3.geo.transform({point: projectPoint});

var sortedByZ = function() {
    return layers.enabled().slice(0).sort(function(a, b){
	return a.options.zIndex - b.options.zIndex;
    });
};

var paint = OpenDataMap.paint(overlay, transform, sortedByZ);
layerOpacity.opacityChanged(paint.redrawAll);

layerOrder.orderChanged(function(){
    layerOrder.orderChanged(paint.redrawAll);
    colour.paintProperty(worksheet.displayData(time.current()), selection.current());
});

var layerSelect = OpenDataMap.layerSelect(d3.select("#layer-select"), layers);

var selection = OpenDataMap.selection(overlay);

var worksheet = OpenDataMap.worksheet(d3.select("#worksheet"), layers, sources, errors);
var resultsTable = OpenDataMap.resultsTable(d3.select("#results"));
var colour = OpenDataMap.colour();
var calculationsDisplay = OpenDataMap.calculationsDisplay(d3.select("#calculations"));


sources.onSourceLoad(worksheet.addSource);

var getLayerObjects = function(layerName) {
    return d3.select("#map svg g#" + layerName)
	.selectAll("path");
};

layers.layerCreated(function(l){
    paint.redrawAll();
    zoomToLayer(l);
    selection.select(getLayerObjects(l.name()), false);
});
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
	    L.latLng(
		(y1 + y2) / 2,
		(x1 + x2) / 2),	    
	    newZoom);
    }
};

paint.addClickHandler(selection.clickHandler);

map.on("viewreset", paint.redrawAll);

/*
 When we click on a layer in the list of layers,
 get all of the shapes in that layer and select them.
 */
layerSelect.onClick(function(layerName){
    if (!d3.event.shiftKey) {
	zoomToLayer(layers.get(layerName));
    }
    selection.select(getLayerObjects(layerName), d3.event.shiftKey);
});

selection.addCallback(function(values, entering, leaving){
    colour.unpaint(leaving);
    worksheet.selectionChanged(values, entering, leaving);
});

OpenDataMap.file.drop(d3.select("body"), errors, handlers.all);

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
    colour.paintProperty(worksheet.displayData(time.current()), selection.current());
});


d3.select("#worksheet")
    .call(OpenDataMap.floatingDialogue.drag)
    .call(OpenDataMap.floatingDialogue.resize);
//    .call(OpenDataMap.floatingDialogue.close);
