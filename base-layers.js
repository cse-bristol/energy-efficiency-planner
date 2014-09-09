"use strict";

/*global module, require*/

var leaflet = require("leaflet"),

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

module.exports = function(errors) {
    return {
	dict: {
	    "Open Street Map" : osmLayer,
	    "Stamen Toner" : Stamen_TonerBackground,
	    "ESRI Relief": Esri_WorldShadedRelief,
	    "ESRI World Imagery" : Esri_WorldImagery
	},
	current: function(map, layersControl, name) {
	    var currentId = Object.keys(map._layers)[0],
		current = layersControl._layers[currentId];

	    if (name === undefined) {
		return current.name;
	    } else {
		map.removeLayer(current.layer);

		var found = false;
		Object.keys(layersControl._layers).forEach(function(k) {
		    var l = layersControl._layers[k];
		    if (l.name === name) {
			map.addLayer(l.layer);
			found = true;
		    }
		});
		if (!found) {
		    errors.warnUser("Layer not found " + name);
		}
		return null;
	    }
	},
	default: function() {
	    return osmLayer;
	}
    };
};

