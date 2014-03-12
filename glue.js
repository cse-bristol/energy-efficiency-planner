"use strict";

/*global d3, topojson, OpenDataMap*/

var width = window.innerWidth / 2;
var height = window.innerHeight - 20;
var templeMeads = [-2.5806295, 51.4496909];
var startCoordinates = templeMeads;
var zoom = 23;

var projection = d3.geo.mercator()
	.center(startCoordinates);

var time = OpenDataMap.timeControl(d3.select("#time-control"), 2013, 2024, 2013);
var areaInfo = OpenDataMap.areaInfo(d3.select("#details"));
var loader = OpenDataMap.loader();
var paint = OpenDataMap.paint(d3.select("#map"), width, height, projection, zoom);
var selection = OpenDataMap.selection(d3.select("#map svg"));
var data = OpenDataMap.geometryData(loader, "data/processed/manifest.json");

/*
 Given a list of selected elements,
 Update area-info with the properties associated with those elements.

 TODO: this breaks if selections cover more than one layer. It should make a separate table for each layer.
 */
var selectionProperties = function(elements) {

    if (elements.length > 0) {
	var first = elements[0];
	var layerName = first.node().parentNode.id;
	var layer = data.layer(layerName);

	var names = elements.map(function(e){
	    return e.attr("id");
	});

	areaInfo.info(layer.propertyNames(), layer.propertiesMatrix(time.current(), names));	
    } else {
	areaInfo.info([], []);
    }
};
paint.addClickHandler(selection.makeClickHandler(selectionProperties));

time.onChange(function(currentDate){
    selectionProperties(selection.current());
});


data.onManifestLoaded(function(){
    paint.setDataSource(data.layers);
    
    data.allLayerNames().forEach(function(l){
	data.onLayerGeometryLoaded(l, function(shape){
	    paint.redrawAll();
	});
    });
});
