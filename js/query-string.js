"use strict";

/*global module, require*/

var URL = require("url"),
    helpers = require("./helpers.js"),
    origin = helpers.origin,
    leaflet = require("leaflet"),
    d3 = require("d3");

module.exports = function(wikiStore, title) {
    var listening = true;

    var build = function() {
	var params = {
	    };
	
	params.page = "maps/" + title.title();

	return params;
    };

    var updateQueryString = function() {
	if (listening) {
	    var url = URL.parse(window.location.href, true);
	    url.search = null;
	    url.query = build();
	    window.history.pushState(null, "Saved", URL.format(url));
	}
    };

    var fromQueryString = function() {
	var query = URL.parse(window.location.href, true).query;
	
	if (query.page) {
	    wikiStore.loadPage(decodeURIComponent(query.page));
	}
    };

    fromQueryString();
    wikiStore.onLoad(updateQueryString);
    wikiStore.onSave(updateQueryString);
    d3.select(window).on("popstate", function() {
	listening = false;
	fromQueryString();
	listening = true;
    });
};
