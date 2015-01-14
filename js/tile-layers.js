"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    d3 = require("d3"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler,
    heatMapLegendFactory = require("./heat-map-legend.js");

var decorateTileLayers = function(tileLayers, opacity) {
    tileLayers.forEach(function(name, layer) {
	layer.name = function() {
	    return name;
	};

	/*
	 Add callback event to setOpacity method.
	 */
	var onSetOpacity = callbacks(),
	    wrapped = layer.setOpacity;
	
	layer.setOpacity = function(opacity) {
	    var result = wrapped.call(layer, opacity);
	    onSetOpacity(opacity);
	    return result;
	};
	layer.onSetOpacity = onSetOpacity.add;
	layer.clearOnSetOpacity = onSetOpacity.clear;

	if (opacity !== undefined) {
	    layer.setOpacity(opacity);
	}
    });
};

/*
 Pre-defined raster layers, including base layers and overlays.

 Keeps track of the current base layer, and provides notifications when it changes.
 */
module.exports = function(getZoom, errors) {
    /*
     Define all our layers.
     */
    var osmLayer = leaflet.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
	}),

	Esri_WorldTopoMap = leaflet.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
	    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
	}),

	baseLayers = d3.map({
	    "Open Street Map" : osmLayer,
	    "Stamen Toner" : Stamen_TonerBackground,
	    "ESRI Relief": Esri_WorldShadedRelief,
	    "ESRI World Imagery" : Esri_WorldImagery,
	    "ESRI World Topography": Esri_WorldTopoMap
	}),
	
	nationalHeatMap = leaflet.tileLayer('/heat-map-cdn/Total%20Heat%20Density/Z{z}/{y}/{x}.png', {
	    attribution: '<a href="http://tools.decc.gov.uk/nationalheatmap/">English National Heat Map</a>,',
	    minZoom: 2,
	    maxZoom: 17,
	    bounds: leaflet.latLngBounds(
		leaflet.latLng(50, -7),
		leaflet.latLng(56, 2)
	    )
	}),

	overlays = d3.map({
	    "English National Heat Map" : nationalHeatMap
	});

    nationalHeatMap.options.zIndex = 1;
    nationalHeatMap.legend = heatMapLegendFactory(getZoom, errors);

    decorateTileLayers(baseLayers);
    decorateTileLayers(overlays, 0);
    
    /*
     Set up hover to see the value of a tile's pixel.
     */
    overlays.values().forEach(function(tileLayer) {
	var colourChanged = callbacks();
	tileLayer.colourChanged = colourChanged.add;

	if (tileLayer.legend !== undefined) {

	    tileLayer.on("tileload", function(e) {
		var cache;

		d3.select(e.tile)
		    .on("mousemove", function() {
			if (cache === undefined) {
			    var canvas = document.createElement("canvas");
			    canvas.width = this.width;
			    canvas.height = this.height;

			    var cache = canvas.getContext("2d");
			    cache.drawImage(this, 0, 0);
			}

			var rect = this.getBoundingClientRect(),
			    x = d3.event.offsetX ? d3.event.offsetX : d3.event.clientX - rect.left,
			    y = d3.event.offsetY ? d3.event.offsetY : d3.event.clientY - rect.top,
			    colourData = cache.getImageData(x, y, 1, 1).data,
			    transparent = colourData[3] === 0;

			colourChanged(d3.rgb(colourData[0], colourData[1], colourData[2]), transparent);
		    });
	    });
	}
    });

    var baseLayer = osmLayer,
	onSetBaseLayer = callbacks();

    return {
	base: baseLayers,
	
	overlays: overlays,
	getBaseLayer: function() {
	    return baseLayer;
	},
	setBaseLayer: function(value) {
	    var old = baseLayer;
	    value.setOpacity(baseLayer.options.opacity);
	    baseLayer = value;
	    onSetBaseLayer(old, baseLayer);
	},
	onSetBaseLayer: onSetBaseLayer.add
    };
};
