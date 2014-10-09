"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    d3 = require("d3"),
    callbackFactory = require("./helpers.js").callbackHandler,

    osmLayer = leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
    }),

    Stamen_TonerBackground = leaflet.tileLayer('http://{s}.tile.stamen.com/toner-background/{z}/{x}/{y}.png', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20
    }),

    Esri_WorldShadedRelief = leaflet.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri',
	maxZoom: 13
    }),

    Esri_WorldImagery = leaflet.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    });

//http://test-tiles.0d9303a4.cdn.memsites.com/Total%20Heat%20Density/Z{z}/{y}/{x}.png
var nationalHeatMap = leaflet.tileLayer('/heat-map-tiles/Total%20Heat%20Density/Z{z}/{y}/{x}.png', {
    attribution: '<a href="http://tools.decc.gov.uk/nationalheatmap/">English National Heat Map</a>,',
    minZoom: 2,
    maxZoom: 17
});

nationalHeatMap.legend = require("./heat-map-legend.js");

nationalHeatMap.options.zIndex = 1;

module.exports = {
    base: d3.map({
	"Open Street Map" : osmLayer,
	"Stamen Toner" : Stamen_TonerBackground,
	"ESRI Relief": Esri_WorldShadedRelief,
	"ESRI World Imagery" : Esri_WorldImagery
    }),
    overlays: d3.map({
	"English National Heat Map" : nationalHeatMap
    }),
    defaultBaseLayer: osmLayer
};

module.exports.overlays.values().forEach(function(tileLayer) {
    var colourChanged = callbackFactory();
    tileLayer.colourChanged = colourChanged.add;

    if (tileLayer.legend !== undefined) {

	tileLayer.on("tileload", function(e) {
	    var cache;

	    d3.select(e.tile)
		.on("mousemove", function() {
		    if (cache === undefined) {
			cache = document.createElement("canvas").getContext("2d");
			cache.drawImage(this, 0, 0);
		    }

		    var colourData = cache.getImageData(d3.event.offsetX, d3.event.offsetY, 1, 1).data;

		    if (colourData[3] > 0) {
			colourChanged(d3.rgb(colourData[0], colourData[1], colourData[2]));
		    }
		});
	});
    }
});