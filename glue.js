"use strict";

/*global d3, topojson, OpenDataMap*/

var width = function(){
    return window.innerWidth / 2;
};
var height = function(){
    return window.innerHeight - 20;
};
var templeMeads = [-2.5806295, 51.4496909];
var startCoordinates = templeMeads;
var zoom = 23;
var manifestFile = "data/processed/manifest.json";

var projection = d3.geo.mercator()
	.center(startCoordinates);

var errors = OpenDataMap.errors(d3.select("#messages"));

var time = OpenDataMap.timeControl(d3.select("#time-control"), 2013, 2024, 2013);
var loader = OpenDataMap.loader();
var sources = OpenDataMap.sources(errors);
var layers = OpenDataMap.layers(errors, sources);
var geometries = OpenDataMap.geometries();
var handlers = OpenDataMap.file.handlers(errors, geometries, layers, sources);
var paint = OpenDataMap.paint(d3.select("#map"), width, height, projection, zoom, layers.all);
var layerSelect = OpenDataMap.layerSelect(d3.select("#layer-select"), layers);
var selection = OpenDataMap.selection(d3.select("#map svg"));

var worksheet = OpenDataMap.worksheet(layers, sources, errors);
var resultsTable = OpenDataMap.resultsTable(d3.select("#results"));
var colour = OpenDataMap.colour();
var calculationsDisplay = OpenDataMap.calculationsDisplay(d3.select("#calculations"));

layers.layerCreated(paint.redrawAll);
paint.addClickHandler(selection.clickHandler);

window.onresize = function() {
    paint.redrawAll();
};

/*
 When we click on a layer in the list of layers,
 get all of the shapes in that layer and select them.
*/
layerSelect.onClick(function(layerName) {
    selection.select(
	d3.select("#map svg g#" + layerName)
	    .selectAll("path"),
	d3.event.shiftKey);
});

selection.addCallback(function(values, entering, leaving){
    colour.unpaint(leaving);
    worksheet.selectionChanged(values, entering, leaving);
});

OpenDataMap.file.drop(d3.select("body"), d3.select("#errors"), handlers.all);
handlers.onSourceLoad(worksheet.addSource);

resultsTable.headerClicked(worksheet.displayProperty);

time.onChange(worksheet.timeChanged);

worksheet.dataChanged(function(){
    resultsTable.info(worksheet.propertyNames(), worksheet.allData(time.current()));
    calculationsDisplay.update(worksheet.sources());
    colour.paintProperty(worksheet.displayData(time.current()), selection.current());    
});

OpenDataMap.manifest(manifestFile, errors, loader, geometries, layers, sources);


