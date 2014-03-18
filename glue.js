"use strict";

/*global d3, topojson, OpenDataMap*/

var width = window.innerWidth / 2;
var height = window.innerHeight - 20;
var templeMeads = [-2.5806295, 51.4496909];
var startCoordinates = templeMeads;
var zoom = 23;

var projection = d3.geo.mercator()
	.center(startCoordinates);

var errors = OpenDataMap.errors(d3.select("#errors"));

var time = OpenDataMap.timeControl(d3.select("#time-control"), 2013, 2024, 2013);
var loader = OpenDataMap.loader();
var data = OpenDataMap.geometryData(loader, "data/processed/manifest.json");

var paint = OpenDataMap.paint(d3.select("#map"), width, height, projection, zoom);
var selection = OpenDataMap.selection(d3.select("#map svg"));

var worksheet = OpenDataMap.worksheet(data, errors);
var areaInfo = OpenDataMap.areaInfo(d3.select("#results"));
var colour = OpenDataMap.colour();
var calculationsDisplay = OpenDataMap.calculationsDisplay(d3.select("#calculations"));


/* When the user clicks on a geometry object, change the selection.
*/
paint.addClickHandler(selection.clickHandler);

selection.addCallback(function(values, entering, leaving){
    colour.unpaint(leaving);
    worksheet.selectionChanged(values, entering, leaving);
});

var files = OpenDataMap.files(errors);
files.drop(d3.select("body"), d3.select("#errors"));
files.onSourceLoad(worksheet.addSource);

areaInfo.addClickHandler(worksheet.displayProperty);

time.onChange(worksheet.timeChanged);

worksheet.dataChanged(function(){
    areaInfo.info(worksheet.propertyNames(), worksheet.allData(time.current()));
    calculationsDisplay.update(worksheet.sources());
    colour.paintProperty(worksheet.displayData(time.current()), selection.current());    
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
