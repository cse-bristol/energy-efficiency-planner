"use strict";

/*global module, require*/

var helpers = require("./helpers.js"),
    rounded = function(x) {
	return helpers.rounded(x, 2);
    };

/*
 Holds data about a legend in the form of labels and colours.

 If there are the same number of labels and colours, each label is assumed to refer to one colour.

 If there is one more label than colour, the labels are assumed to be boundary conditions. The legend is therefore assumed to be continuous and monotonic.
  */
module.exports = function(labels, colours) {
    var labelLen = labels.length,
	colourLen = colours.length;

    if (colourLen === 0) {
	labels = [];
    }

    labels = labels.map(rounded);

    if (!(labelLen === colourLen || labelLen === colourLen + 1)) {
	throw new Error("When creating a legend, the number of labels must be either equal to or one greater than the number of colours..");
    }

    return {
	isBoundary: function() {
	    return labelLen === colourLen + 1;
	},
	
	colours: function() {
	    return colours;
	},
	
	labels: function() {
	    return labels;
	}
    };
};
