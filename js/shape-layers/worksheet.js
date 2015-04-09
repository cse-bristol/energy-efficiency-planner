"use strict";

/*global module, require*/

var d3 = require("d3"),
    _ = require("lodash"),
    colour = require("../colour.js"),
    nextColour = colour.next,
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
 Provides access to our data as a table structure.

 Describes how we want our data to be displayed:
 * Sort
 * Colour
 * Size (for points)
 */
module.exports = function() {
    return function(shapeData) {
	var headers = shapeHeaders(shapeData),
	    sortProperties = [],
	    reverseSort = [],
	    
	    sortPropertyChanged = callbacks(),
	    baseColourChanged = callbacks(),

	    colourFun,
 
	    baseColour = nextColour(),
	    propertyIsNum = d3.map();

	sortPropertyChanged.add(function() {
	    colourFun = null;
	});
	
	baseColourChanged.add(function() {
	    colourFun = null;
	});	    	
	    
	var m = {
	    setBaseColour: function(newColour) {
		baseColour = newColour;
		baseColourChanged(newColour);
		return m;		
	    },

	    /*
	     The colour from which the scale will be derived.
	     */
	    baseColour: function() {
		return baseColour;
	    },

	    /*
	     Returns a function which will take a piece of data and give back a colour.
	     */
	    getColourFunction: function() {
		if (!colourFun) {
		    if (sortProperties.length === 0) {
			colourFun = function(data) {
			    return baseColour;
			};
			
		    } else {
			var column = sortProperties[0],
			    data = m.data([column]),
			    scale = colour.scale(data, baseColour);

			colourFun = scale;
		    }
		}

		return colourFun;
	    },

	    /*
	     Given a shape and a named column, get the data from it.
	     */
	    getShapeData: function(d, column) {
		if (column === "id") {
		    return d.id;
		} else {
		    return d.properties[column];
		}
	    },

	    /*
	     Returns the column which should be used to colour data or shapes.
	     */
	    getColourColumn: function() {
		return sortProperties[0];
	    },

	    sortProperty : function(property, additional) {
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
