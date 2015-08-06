"use strict";

/*global module, require*/

var _ = require("lodash"),
    d3 = require("d3"),
    leaflet = require("leaflet"),
    geocoderFactory = require("leaflet-control-geocoder"),

    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler;
    
/*
 Modifies the leaflet-control-geocoder library such that the control will be displayed inside the file menu contents 
 */
module.exports = function(map) {
    var geocoder = new geocoderFactory({
	    email: "research@cse.org.uk",
	    collapsed: false,
	    placeholder: 'Find Location'
    }),

	onDisplayResults = callbacks();

    geocoder.addTo = function(map) {
      this._map = map;
      var container = this._container = this.onAdd(map);

	leaflet.DomUtil.removeClass(container, 'leaflet-bar');

	return this;
    };

    map.addControl(geocoder);
    leaflet.DomEvent.addListener(
    	geocoder._input,
    	"blur",
    	_.debounce(geocoder._clearResults, 100),
    	geocoder
    );

    geocoder._geocodeResult = function(wrapped) {
	return function(results) {
	    if (results.length !== 1) {
		onDisplayResults();
	    }
	    
	    return wrapped.apply(this, arguments);
	};
    }(geocoder._geocodeResult);

    return {
	insertInContainer: function(fileMenu) {
	    var container = fileMenu.container.menuBar.node();
	    
	    container
		.insertBefore(
		    geocoder._container,
		    container.childNodes[1]
		);

	    onDisplayResults.add(fileMenu.container.hide);
	}
    };
};
