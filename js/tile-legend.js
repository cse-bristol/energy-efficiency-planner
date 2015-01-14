"use strict";

/*global module, require*/

/*
 Holds data about a legend for a tile layer.

 The legend is assumed to be numerical and continuous (no gaps). 
 Each colour will represent a range of numbers. 
 Each adjacent pair of numbers bounds the range for a colour.
  */
module.exports = function(numbers, colours) {
    if (!numbers.length === colours.length + 1) {
	throw new Error("There should be one more number than colour when creating a tile layer legend.");
    }

    return {
	colours: function() {
	    return colours;
	},
	
	colourIndex: function(colour) {
	    return colours.indexOf(colour.toString());
	},

	numbers: function() {
	    return numbers;
	}
    };
};
