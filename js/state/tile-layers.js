"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    _ = require("lodash"),
    d3 = require("d3"),

    heatMapLayerFactory = require("./heat-map-layers/heat-map-layers.js");

var decorateTileLayers = function(tileLayers) {
    tileLayers.forEach(function(name, layer) {
	layer.name = function() {
	    return name;
	};

	layer.getOpacity = function() {
	    return layer.options.opacity;
	};

	layer.setOpacity(1);
    });
};

/*
 Pre-defined raster layers, including base layers and overlays.

 Keeps track of the current base layer, and provides notifications when it changes.
 */
module.exports = function(getZoom) {
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

	makeHeatMapLayer = heatMapLayerFactory.leafletLayers(getZoom),

	availableOverlays = d3.map(),
	overlays = d3.map();

    heatMapLayerFactory.layerNames.forEach(function(heatMapLayer) {
	availableOverlays.set(heatMapLayer, makeHeatMapLayer(heatMapLayer));
    });

    decorateTileLayers(baseLayers);
    decorateTileLayers(availableOverlays);
    
    var baseLayer = osmLayer;
    return {
	base: baseLayers,

	availableOverlays: availableOverlays,

	overlays: overlays,

	addOverlay: function(overlayName) {
	    if (!overlays.has(overlayName)) {
		if (!availableOverlays.has(overlayName)) {
		    throw new Error("Unknown overlay: " + overlayName);
		}
		
		overlays.set(overlayName, availableOverlays.get(overlayName));
	    }
	},

	removeOverlay: function(overlayName) {
	    if (overlays.has(overlayName)) {
		overlays.remove(overlayName);
	    }
	},
	
	getBaseLayer: function() {
	    return baseLayer;
	},
	setBaseLayer: function(value) {
	    var old = baseLayer;
	    value.setOpacity(baseLayer.getOpacity());
	    baseLayer = value;
	}
    };
};
