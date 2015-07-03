"use strict";

/*global module, require*/

var _ = require("lodash"),
    d3 = require("d3");

/*
 Provides a cache of the sort order for a single shape layer.
 */
module.exports = function(shapeData, sortPropertyChanged, getSortProperties) {
    var sort = null,
	indices = null,

	/*
	 Sort the indicies of the array, rather than the data.
	 */
	cache = function() {
	    var originalIndices = _.range(shapeData.length);

	    if (sort) {
		indices = _.sortByOrder(
		    originalIndices,
		    sort.properties.map(function(p) {
			return function(index) {
			    return shapeData[index].properties[p];
			};
		    }),
		    sort.reverse.map(function(r) {
			return r ? "desc" : "asc";
		    })
		);
	    } else {
		indices = originalIndices;
	    }
	},

	order = function() {
	    if (!indices) {
		cache();
	    }

	    return indices;
	};

    sortPropertyChanged(function() {
	var newSortProperties = getSortProperties();

	if (!_.eq(newSortProperties, sort)) {
	    sort = newSortProperties;
	    indices = null;
	}
    });

    return {
	order: order
    };
};
