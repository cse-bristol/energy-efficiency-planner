"use strict";

/*global d3, topojson, OpenDataMap*/

var width = window.innerWidth / 2;
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
 Given a list of selected elements,
 Update area-info with the properties associated with those elements.

 TODO: make this work for selections which cover more than one layer.
 */
var selectionProperties = function(elements) {

    if (elements.length > 0) {
	var first = elements[0];
	var layerName = first.node().parentNode.id;
	var layer = data.layer(layerName);

	var names = elements.map(function(e){
	    return e.attr("id");
	});

	areaInfo.info(layer.propertyNames(), layer.propertiesMatrix(date, names));	
    } else {
	areaInfo.info([], []);
    }
};

paint.addClickHandler(selection.makeClickHandler(selectionProperties));

data.onManifestLoaded(function(){
    paint.setDataSource(data.layers);
    
    data.allLayerNames().forEach(function(l){
	data.onLayerGeometryLoaded(l, function(shape){
	    paint.redrawAll();
	});
    });
});
