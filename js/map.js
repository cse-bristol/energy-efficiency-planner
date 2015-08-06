"use strict";

/*global module, require */

var d3 = require("d3"),
    _ = require("lodash"),
    leaflet = require("leaflet"),
    zoombox = require("../node_modules/leaflet-zoombox/L.Control.ZoomBox.min.js"),
    
    log2 = function(n) {
	return Math.log(n) / Math.LN2;
    };

/*
 Make d3.geo.tile available.
 */
require("../lib/d3-plugins/geo/tile/tile.js");

/*
 Wraps a Leaflet map. Exposes some things about the map which we care about.
 */
module.exports = function(container) {
    // Remove any existing map.
    container.select("#map").remove();
    
    var baseLayer = null,

	mapDiv = container.append("div").attr("id", "map"),
	map = new leaflet.Map(
	    mapDiv.node(),
	    {
		zoomControl: false,
		doubleClickZoom: false
	    }
	)
    // We need to set the view in order for _initPathRoot() to work.
	    .setView(
		leaflet.latLng(0, 0),
		2
	    ),

	projectPoint = function(x, y) {
	    var point = map.latLngToLayerPoint(leaflet.latLng(y, x));
	    this.stream.point(point.x, point.y);
	},
	
	projectTile = d3.geo.transform({point: projectPoint});
    
    /* The map will make us an overlay svg. It will automatically sort out its bounds for us. */
    map._initPathRoot();
    var overlay = d3.select(map.getPanes().overlayPane)
	    .select("svg")
	    .attr("id", "overlay");

    map.setView(leaflet.latLng(0, 0), 2);

    return {
	zoomTo: function(bbox) {
	    map.fitBounds([
		// South-West
		[bbox[1], bbox[0]],
		// North-East
		[bbox[3], bbox[2]]
	    ]);
	},

	setView: _.bind(map.setView, map),

	getCenter: _.bind(map.getCenter, map),
	
	getZoom: _.bind(map.getZoom, map),

	eachLayer: _.bind(map.eachLayer, map),

	addLayer: _.bind(map.addLayer, map),

	hasLayer: _.bind(map.hasLayer, map),

	removeLayer: _.bind(map.removeLayer, map),

	projectTile: projectTile,

	overlay: overlay,

	addControl: _.bind(map.addControl, map),

	onViewReset: function(callback) {
	    map.on("viewreset", callback);
	},

	setBaseLayer: function(newBaseLayer) {
	    if (baseLayer) {
		if (baseLayer === newBaseLayer) {
		    return;
		} else {
		    map.removeLayer(baseLayer);
		}
	    }

	    baseLayer = newBaseLayer;
	    map.addLayer(newBaseLayer);
	},

	update: function(layers) {
	    map.eachLayer(function(l) {
		if (l !== baseLayer && layers.indexOf(l) === -1) {
		    map.removeLayer(l);
		}
	    });

	    layers.forEach(function(l) {
		if (!map.hasLayer(l)) {
		    map.addLayer(l);
		}
	    });
	}
    };
};
