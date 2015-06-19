"use strict";

/*global module, require*/

var d3 = require("d3"),
    _ = require("lodash"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler,
    legendFactory = require("./legend-data.js"),
    maxZoom = 17,

    broken = false;

module.exports = function(getZoom, errors) {
    return function(baseUrl) {
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
			legendByZoom.set(z, legendFactory.bins(data.legend));

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
		legendFactory.bins([]);
	};

	f.units = 'kWh/m<sup>2</sup>/year';
	f.onLoad = onLoad.add;
	
	return f;
    };
};

