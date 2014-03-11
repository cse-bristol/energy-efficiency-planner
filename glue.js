"use strict";

/*global d3, topojson, OpenDataMap*/

var width = window.innerWidth - 400;
var height = window.innerHeight - 10;
var templeMeads = [-2.5806295, 51.4496909];
var startCoordinates = templeMeads;
var zoom = 23;
var date = 2013;

var projection = d3.geo.mercator()
	.center(startCoordinates);

var areaInfo = OpenDataMap.areaInfo(d3.select("#details"));
var loader = OpenDataMap.loader();
var paint = OpenDataMap.paint(d3.select("#map"), width, height, projection, zoom);
var selection = OpenDataMap.selection(d3.select("#map svg"));
var data = OpenDataMap.geometryData(loader, "data/processed/manifest.json");

/*
 Given an event which comes from an element for which the data was set to a topojson shape.
 Return a list of map entries which are the properties on that shape.
 */
var extractGeometryProperties = function(event) {
    return d3.map(event.properties).entries();
};

paint.addClickHandler(selection.makeClickHandler(areaInfo.info, extractGeometryProperties));

data.onManifestLoaded(function(){
    paint.setDataSource(data.layers);
    
    data.allLayerNames().forEach(function(l){
	data.onLayerGeometryLoaded(l, function(shape){
	    paint.redrawAll();
	});
    });
});
