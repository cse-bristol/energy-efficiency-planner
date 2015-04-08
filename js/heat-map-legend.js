"use strict";

/*global module, require*/

var d3 = require("d3"),
    _ = require("lodash"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler,
    legendFactory = require("./legend-data.js"),
    maxZoom = 17,
    baseUrl = (function() {
	var a = document.createElement("a");
	a.href = "/heat-map-cdn/Total Heat Density";
	return a.href;
    }()),
    broken = false;

module.exports = function(getZoom, errors) {
    var legendByZoom = d3.map(),
	onLoad = callbacks();

    // loop over the zoom levels
    _.range(1, maxZoom + 1).forEach(function(z) {
	d3.json(
	    baseUrl + "/legend_Z" + z + ".json",
	    function(error, data) {
		if (error) {
		    if (!broken) {
			errors.warnUser("Failed to load heat map legend: " + error.response);
			broken = true;
		    }
		} else {
		    var numbers = [],
			colours = [];

		    data.legend.forEach(function(range, i) {
			if (i === 0) {
			    numbers.push(range.min);
			}

			// Must be American spelling here
			colours.push(range.color);

			numbers.push(range.max);
		    });

		    legendByZoom.set(z, legendFactory(numbers, colours));

		    onLoad();
		}
	    });
    });

    var f = function() {
	var z = getZoom();

	if (z > maxZoom) {
	    z = maxZoom;
	}

	return legendByZoom.has(z) ?
	    legendByZoom.get(z) :
	    legendFactory([0], []);
    };

    f.units = 'kWh/m<sup>2</sup>/year';
    f.onLoad = onLoad.add;
    
    return f;
};
