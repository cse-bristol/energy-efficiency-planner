"use strict";

/*global module, require*/

var URL = require("url"),
    helpers = require("./helpers.js"),
    leaflet = require("leaflet");

/*
 TODO write this comment.
 */
var build = function(map) {
    var latLng = map.getCenter();

    return {
	"zoom": map.getZoom(),
	"lat": latLng.lat,
	"lng": latLng.lng
    };
};

module.exports = {
    updateQueryString: function(map) {
	var url = URL.parse(window.location.href, true);
	url.search = null;
	url.query = build(map);
	window.history.pushState(null, "", URL.format(url));
    },
    fromQueryString: function(map) {
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
    }
};
