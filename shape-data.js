"use strict";

/*global module, require*/

var d3 = require("d3"),
    _ = require("lodash"),
    callbackFactory = require("./helpers.js").callbackHandler;

var shapeHeaders = function(shapeData) {
    var headers = ["id"];

    shapeData.forEach(function(shape) {
	headers = headers.concat(Object.keys(shape.properties));
    });

    headers = _.uniq(headers);

    return headers;
};

module.exports = function() {
    var colours = d3.scale.category10(),
	colourI = 0;
    
    var nextColour = function() {
	return colours((colourI++ % 10));
    };

    return function(shapeData) {
	var headers = shapeHeaders(shapeData),
	    sortProperties = [],
	    reverseSort = [],
	    sortPropertyChanged = callbackFactory(),
	    baseColourChanged = callbackFactory(),
	    baseColour = nextColour(),
	    sortColour = "black";

	var m = {
	    baseColour: function(val) {
		if (val === undefined) {
		    return baseColour;
		} else {
		    baseColour = val;
		    baseColourChanged();
		    return m;
		}
	    },

	    sortProperty : function(property, additional) {
		var i = sortProperties.indexOf(property);
		if (i >= 0) {
		    if (additional) {
			/* reverse this property */
			reverseSort[i] = !reverseSort[i];
		    } else {
			/* sort on just this property, reversed  */
			sortProperties = [property];
			reverseSort = [!reverseSort[i]];
		    }
		} else {
		    if (additional) {
			/* add new property with normal sort  */
			sortProperties.push(property);
			reverseSort.push(false);
		    } else {
			/* sort on just this property */
			sortProperties = [property];
			reverseSort = [false];
		    }
		}
		sortPropertyChanged();
	    },

	    getSortProperties : function() {
		return {
		    "properties" : sortProperties, 
		    "reverse" : reverseSort
		};
	    },

	    data: function(columns) {
		if (headers === undefined) {
		    return m.data(headers);
		} else {
		    return shapeData.map(function(s) {
			return columns.map(function(c) {
			    if (c === "id") {
				return s[c];
			    } else {
				return s.properties[c];
			    }
			});
		    });
		}
	    },

	    headers: function() {
		return headers;
	    },

	    sortPropertyChanged: sortPropertyChanged.add,

	    baseColourChanged: baseColourChanged.add
	};
	return m;
    };
};