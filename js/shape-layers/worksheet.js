"use strict";

/*global module, require*/

var d3 = require("d3"),
    _ = require("lodash"),
    colour = require("../colour.js"),
    helpers = require("../helpers.js"),
    callbacks = helpers.callbackHandler,
    isNum = helpers.isNum,
    bin = helpers.bin;

var shapeHeaders = function(shapeData) {
    var headers = ["id"];

    shapeData.forEach(function(shape) {
	headers = headers.concat(Object.keys(shape.properties));
    });

    headers = _.uniq(headers);

    return headers;
};

/*
 Data about a single shape layer's table and colouring.
 */
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
	    sortPropertyChanged = callbacks(),
	    baseColourChanged = callbacks(),
	    baseColour = nextColour(),
	    propertyIsNum = d3.map(),
	    sortColour = "black",
	    /* Cache the colour funciton for this layer. Expires when the sort property changes. */
	    colourFun;

	var m = {
	    baseColour: function(val) {
		colourFun = undefined;

		if (val === undefined) {
		    return baseColour;
		} else {
		    baseColour = val;
		    baseColourChanged(val);
		    return m;
		}
	    },

	    colour: function() {
		if (!colourFun) {
		    if (sortProperties.length === 0) {
			colourFun = baseColour;
		    } else {
			var column = sortProperties[0],
			    data = m.data([column]),
			    scale = colour.scale(data, baseColour);

			colourFun = scale;
		    }
		}

		return colourFun;
	    },

	    colourFun: function() {
		var f = m.colour();

		if (typeof(f) === "string") {
		    return function(data) {
			return f;
		    };
		} else {
		    return f;
		};
	    },

	    shapeColour: function() {
		var colour = m.colour();
		
		if (sortProperties.length === 0) {
		    return colour;
		} else {
		    var col = sortProperties[0];
		    if (col === "id") {
			return function(d, i) {
			    return colour(d.id);
			};
		    }

		    return function(d, i) {
			return colour(d.properties[col]);
		    };
		}
	    },

	    sortProperty : function(property, additional) {
		colourFun = undefined;

		if (property) {

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
		} else if (sortProperties.length > 0) {
		    // Clear sort properties;
		    sortProperties = [];
		    reverseSort = [];
		}
		sortPropertyChanged();
	    },

	    getSortProperties : function() {
		return {
		    "properties" : sortProperties, 
		    "reverse" : reverseSort
		};
	    },

	    firstSortPropertyI: function() {
		if (sortProperties.length === 0) {
		    throw new Error("No sort properties");
		}

		return headers.indexOf(sortProperties[0]);
	    },

	    data: function(columns) {
		if (columns === undefined) {
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

	    /*
	     Looks at the first sort property.

	     If it's categorical, returns all the unique data for it.

	     If it's numerical, returns bins for a histogram.
	     */
	    sortPropertyBins: function(bins) {
		if (!bins) {
		    throw new Error("bins parameter must be specified");
		}
		
		if (sortProperties.length === 0) {
		    return [""];
		} else {
		    var p = sortProperties[0],
			columnData = _.flatten(
			    m.data([p])
			);
		    
		    if (!propertyIsNum.has(p)) {
			propertyIsNum.set(
			    p,
			    _.all(columnData, isNum)
			);
		    }

		    if (propertyIsNum.get(p)) {
			
			
			return bin(
			    _.min(columnData),
			    _.max(columnData),
			    bins
			);
			
		    } else {
			return _.uniq(columnData);
		    }
		}
	    },

	    sortPropertyChanged: sortPropertyChanged.add,

	    baseColourChanged: baseColourChanged.add
	};
	return m;
    };
};
