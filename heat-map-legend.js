"use strict";

/*global module, require*/

var d3 = require("d3"),
    _ = require("lodash"),
    rounded = require("./helpers.js").rounded,
    maxZoom = 17;

module.exports = function(map, errors) {
    var legendByZoom = d3.map();

    // loop over the zoom levels
    _.range(1, maxZoom + 1).forEach(function(z) {
	d3.json(
	    "http://localhost/heat-map-cdn/Total Heat Density/legend_Z" + z + ".json",
	    function(error, data) {
		if (error) {
		    errors(error);
		} else {
		    var legend = d3.map();

		    data.legend.forEach(function(range) {
			var min = rounded(range.min),
			    max = rounded(range.max);

			legend.set(
			    // Must be American spelling here
			    range.color, 
			    min + " to " + max
			);
		    });

		    legendByZoom.set(z, legend);
		}
	    });
    });

    return function(colour) {
	var z = map.getZoom();

	if (z > maxZoom) {
	    z = maxZoom;
	}

	if (legendByZoom.has(z)) {
	    var legend = legendByZoom.get(z);

	    if (legend.has(colour)) {
		return legend.get(colour);
	    }
	}

	return "";
    };
};
