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
var colour = OpenDataMap.colour();
var selection = OpenDataMap.selection(d3.select("#map svg"));
var data = OpenDataMap.geometryData(loader, "data/processed/manifest.json");

/*
 Given a list of selected elements,
 Update area-info with the properties associated with those elements.

 TODO: this breaks if selections cover more than one layer. We should consider how selection of many layers works.
 */
var selectionProperties = function(selected, entering, leaving) {

    if (selected.length > 0) {
	/* .node() takes its node from the first non-null item in the selection. */
	var layerName = selected.node().parentNode.id;
	var layer = data.layer(layerName);

	
	var names = [];

	selected.each(function(e){
	    names.push(e.properties.Name);
	});

	areaInfo.info(layer.propertyNames(), layer.propertiesMatrix(time.current(), names));	
    } else {
	areaInfo.info([], []);
    }
};
paint.addClickHandler(selection.clickHandler(selectionProperties));
selection.addCallback(selectionProperties);

selection.addCallback(function(selected, entering, leaving){
    leaving.attr("fill", null);
    colour.paintProperty(null, selected);
});

areaInfo.addClickHandler(function(header, column){
    colour.paintProperty(column, selection.current());
});

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
