"use strict";

/*global module, require*/

var d3 = require("d3"),
    _ = require("lodash");

/*
 Holds data about a legend in the form of labels and colours.
 */
module.exports = {
    bins: function(ranges) {
	var labelsByColour = d3.map();

	ranges.forEach(function(range, i) {
	    var colour = range.colour || range.color;
	    
	    if (labelsByColour.has(colour)) {
		var existing = labelsByColour.get(colour);

		labelsByColour.set(
		    colour,
		    [
			Math.min(existing[0], range.min),
			Math.max(existing[1], range.max)
		    ]
		);
		
	    } else {
		labelsByColour.set(
		    colour,
		    [range.min, range.max]
		);
	    }
	});
	
	return {
	    numeric: true,
	    width: 2,
	    labelsByColour: labelsByColour
	};
    },

    sampled: function(samples, colourFun) {
	var labelsByColour = d3.map();

	samples.forEach(function(sample) {
	    labelsByColour.set(colourFun(sample), [sample]);
	});
	
	return {
	    numeric: true,
	    width: 1,
	    labelsByColour: labelsByColour
	};
    },

    categorical: function(colours, colourFunction, categories) {
	var categoriesByColour = d3.map();

	categories.forEach(function(category) {
	    var colour = colourFunction(category);

	    if (!categoriesByColour.get(colour)) {
		categoriesByColour.set(colour, d3.set());
	    }
	    
	    categoriesByColour.get(colour)
		.add(category);
	});

	categoriesByColour.keys().forEach(function(colour) {
	    categoriesByColour.set(
		colour,
		categoriesByColour.get(colour).values()
	    );
	});
	
	return {
	    numeric: false,
	    width: _.max(
		categoriesByColour.values().map(function(categories) {
		    return categories.length;
		})),
	    labelsByColour: categoriesByColour
	};
    }
};

