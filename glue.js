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
var worksheet = OpenDataMap.worksheet(data);


var colourMap = function(){
    colour.paintProperty(worksheet.displayData(time.current()), selection.current());    
};

var updatePropertiesPanel = function() {
    areaInfo.info(worksheet.propertyNames(), worksheet.allData(time.current()));
};

/* When the user clicks on a geometry object, change the selection.
*/
paint.addClickHandler(selection.clickHandler);

selection.addCallback(function(values, entering, leaving){
    worksheet.selectionChanged(values, entering, leaving);
    colour.unpaint(leaving);
    colourMap();
    updatePropertiesPanel();
});

areaInfo.addClickHandler(function(header, column){
    worksheet.displayProperty(header);
    colourMap();
});

time.onChange(function(currentDate){
    colourMap();
    updatePropertiesPanel();
});

var selectLayer = function(layerName) {
    selection.select(
	d3.select("#map")
	    .select("svg")
	    .select("g#" + layerName)
	    .selectAll("path"),
	d3.event.shiftKey);
};

/* When the manifest file has loaded, go and get some geometry. 
 Redraw the map as the geometry comes in.  
 */
data.onManifestLoaded(function(){
    paint.setDataSource(data.layers);
    var layerSelect = OpenDataMap.layerSelect(d3.select("#layer-select"), null, data.allLayerNames());
    layerSelect.onClick(selectLayer);
    
    data.allLayerNames().forEach(function(l){
	data.onLayerGeometryLoaded(l, function(shape){
	    paint.redrawAll();
	});
    });
});
