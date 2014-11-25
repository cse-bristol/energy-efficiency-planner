"use strict";

/*global module, require */

var d3 = require("d3"),
    _ = require("lodash"),
    leaflet = require("leaflet"),
    geocoder = require("leaflet-control-geocoder"),
    
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
    
    var mapDiv = container.append("div").attr("id", "map"),
	map = new leaflet.Map(
	    mapDiv.node(),
	    {
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
    
    map.addControl(new geocoder({
	email: "research@cse.org.uk"
    }));
    
    return {
	zoomTo: function(bbox) {
	    var x1 = bbox[0],
		y1 = bbox[1],
		x2 = bbox[2],
		y2 = bbox[3];

	    var boxSize = Math.max(
		Math.abs(x1 - x2),
		Math.abs(y1 - y2));

	    var newZoom = Math.round(
		log2(360 / boxSize) + 1.5);
	    console.log("new zoom " + newZoom);
	    console.log("new bounds " + [(y1 + y2) / 2, (x1 + x2) / 2]);
	    
	    map.setView(
		leaflet.latLng(
		    (y1 + y2) / 2,
		    (x1 + x2) / 2),
		newZoom);
	},

	setView: _.bind(map.setView, map),

	getZoom: _.bind(map.getZoom, map),

	eachLayer: _.bind(map.eachLayer, map),

	addLayer: _.bind(map.addLayer, map),

	removeLayer: _.bind(map.removeLayer, map),

	projectTile: projectTile,

	overlay: overlay,

	onViewReset: function(callback) {
	    map.on("viewReset", callback);
	}
    };
};
