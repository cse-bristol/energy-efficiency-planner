"use strict";

/*global module, require*/

var colour = require("../../../colour.js");

module.exports = function(sortPropertyChanged, baseColourChanged, getBaseColour, getColourColumn, getColumnData, isNumericColumn) {
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
		    var data = getColumnData(column),

			scaleF = isNumericColumn(column) ? colour.numericScale : colour.categoricalScale,
			scale = scaleF(data, getBaseColour());

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
