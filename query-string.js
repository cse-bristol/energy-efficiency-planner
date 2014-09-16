"use strict";

/*global module, require*/

var URL = require("url"),
    helpers = require("./helpers.js"),
    origin = helpers.origin,
    leaflet = require("leaflet"),
    d3 = require("d3");

module.exports = function(map, layersControl, baseLayers, wikiStore, title, errors) {
    var listening = true;

    var build = function() {
	var latLng = map.getCenter(),
	    params = {
		"zoom": map.getZoom(),
		"lat": latLng.lat,
		"lng": latLng.lng,
		"base": baseLayers.current(map, layersControl)
	    };
	
	if (wikiStore.baseURLValid()) {
	    params.wiki = wikiStore.baseURL();
	}

	params.page = title.title();

	return params;
    };

    var updateQueryString = function() {
	if (listening) {
	    var url = URL.parse(window.location.href, true);
	    url.search = null;
	    url.query = build();
	    window.history.pushState(null, "", URL.format(url));
	}
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
	
	if (query.page) {
	    title.title(query.page);
	}

	if (query.wiki) {
	    wikiStore.baseURL(
		query.wiki,
		function baseURLOK(baseURL) {
		    if (query.page) {
			wikiStore.loadPage(query.page);
		    }
		}, 
		errors.warnUser
	    );
	} else {
	    wikiStore.baseURL(origin());
	}
    };

    fromQueryString();
    map.on("moveend", updateQueryString);
    map.on("baselayerchange", updateQueryString);
    title.onChange(updateQueryString);
    d3.select(window).on("popstate", function() {
	listening = false;
	fromQueryString();
	listening = true;
    });
};
