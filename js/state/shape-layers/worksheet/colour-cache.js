"use strict";

/*global module, require*/

var colour = require("../../../colour.js");

module.exports = function(sortPropertyChanged, baseColourChanged, getBaseColour, getColourColumn, getColumnData) {
    var colourFunction = null;

	sortPropertyChanged(function() {
	    colourFunction = null;
	});
	
	baseColourChanged(function() {
	    colourFunction = null;
	});
    
    return {
	getColourFunction: function() {
	    if (!colourFunction) {
		var column = getColourColumn();
		
		if (column) {
		    var data = getColumnData(),
			scale = colour.scale(data, getBaseColour());

		    colourFunction = scale;
		    
		} else {
		    colourFunction = function(data) {
			return getBaseColour();
		    };
		}
	    }

	    return colourFunction;
	}
    };
};
