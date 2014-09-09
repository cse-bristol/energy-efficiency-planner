"use strict";

/*global module, require*/

var URL = require("url"),
    helpers = require("./helpers.js"),
    leaflet = require("leaflet"),
    d3 = require("d3");

module.exports = function(map, layersControl, baseLayers) {
    var build = function() {
	var latLng = map.getCenter();

	return {
	    "zoom": map.getZoom(),
	    "lat": latLng.lat,
	    "lng": latLng.lng,
	    "base": baseLayers.current(map, layersControl)
	};
    };

    var updateQueryString = function() {
	var url = URL.parse(window.location.href, true);
	url.search = null;
	url.query = build();
	window.history.pushState(null, "", URL.format(url));
    };

    var fromQueryString = function() {
	var query = URL.parse(window.location.href, true).query,
	    zoom = helpers.isNum(query.zoom) ? query.zoom : map.getZoom(),
	    lat = helpers.isNum(query.lat) ? query.lat : map.getCenter().lat,
	    lng = helpers.isNum(query.lng) ? query.lng : map.getCenter().lng;
	
	map.setView(
	    leaflet.latLng(lat, lng),
	    zoom,
	    {
		animate: false
	    }
	);

	if (query.base) {
	    baseLayers.current(map, layersControl, query.base);
	}
    };

    fromQueryString();
    map.on("moveend", function(e) {
	updateQueryString();
    });
    map.on("baselayerchange", function(e) {
	updateQueryString();
    });
    d3.select(window).on("popstate", function() {
	fromQueryString();
    });
};
