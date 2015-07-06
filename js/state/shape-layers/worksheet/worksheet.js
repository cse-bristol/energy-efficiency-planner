"use strict";

/*global module, require*/

var d3 = require("d3"),
    _ = require("lodash"),
    colourCacheFactory = require("./colour-cache.js"),
    indexFactory = require("./worksheet-index.js"),
    cooerceNumericsFactory = require("./cooerce-numerics.js"),
    columnSizesFactory = require("./column-size-cache.js"),
    
    colours = require("../../../colour.js"),
    nextColour = colours.next,
    reverseColour = colours.reverse,
    helpers = require("../../../helpers.js"),
    callbacks = helpers.callbackHandler,

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
 * Sort columns
 * Colour
 */
module.exports = function() {
    return function(shapeData) {
	shapeData.forEach(function(shape) {
	    shape.properties.id = shape.id;
	});
	
	var getColourColumn = function() {
	    return sortProperties.length > 0 ? sortProperties[0] : null;
	},
	    getBaseColour = function() {
		return baseColour;
	    },

	    getShapeData = function(shape, column) {
		return shape.properties[column];
	    },

	    getColumnData = function(column) {
		if (column === undefined) {
		    throw new Error("Define a column when getting column data.");
		}
		
		return shapeData.map(function(shape) {
		    return getShapeData(shape, column);
		});
	    },

	    getSortProperties = function() {
		return {
		    "properties" : sortProperties, 
		    "reverse" : reverseSort
		};
	    },
	    
	    headers = shapeHeaders(shapeData),
	    /* 
	     Modifies shapeData by rewriting properties where all the values are numeric strings to be actual numbers.
	     */
	    cooerceNumerics = cooerceNumericsFactory(shapeData, headers, getColumnData),
	    sortProperties = [],
	    reverseSort = [],

 	    baseColour = nextColour(),
	    
	    sortPropertyChanged = callbacks(),
	    baseColourChanged = callbacks(),

	    colourCache = colourCacheFactory(sortPropertyChanged.add, baseColourChanged.add, getBaseColour, getColourColumn, getColumnData, cooerceNumerics.isNumeric),
	    sortIndex = indexFactory(shapeData, sortPropertyChanged.add, getSortProperties),
	    columnSizes = columnSizesFactory(shapeData, headers);

	return {
	    setBaseColour: function(newColour) {
		baseColour = newColour;
		baseColourChanged(newColour);
	    },

	    /*
	     The colour from which the scale will be derived.
	     */
	    baseColour: getBaseColour,

	    /*
	     Returns a function which will take a piece of data and give back a colour.
	     */
	    getColourFunction: colourCache.getColourFunction,

	    /*
	     Given a shape and a named column, get the data from it.
	     */
	    getShapeData: getShapeData,

	    /*
	     Returns the column which should be used to colour data or shapes.
	     */
	    getColourColumn: getColourColumn,

	    getGeometry: function(shapeId) {
		var matches = shapeData.filter(function(shape) {
		    return shape.id === shapeId;
		});

		if (matches.length === 1) {
		    return matches[0];
		} else {
		    return null;
		}
	    },

	    sortProperty: function(property, additional) {
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

	    getSortProperties: getSortProperties,

	    firstSortPropertyI: function() {
		if (sortProperties.length === 0) {
		    throw new Error("No sort properties");
		}

		return headers.indexOf(sortProperties[0]);
	    },

	    headers: function() {
		return headers;
	    },

	    headersWithSort: function() {
		return headers.map(function(header, i) {
		    var sort = sortProperties.indexOf(header);
		    
		    return {
			name: header,
			sort: sort >= 0 ?
			    (reverseSort[sort] ? "ascending" : "descending") :
			null,
			width: columnSizes.byIndex(i)
		    };
		});
	    },

	    /*
	     Given a column name, load an array of the data for that column (not sorted).
	     */
	    getColumnData: getColumnData,

	    /*
	     Return an array of arrays of the data in this shape.

	     This will be sorted by the sort properties.
	     */
	    getRowData: function() {
		return sortIndex.order()
		    .map(function(i) {
			var shape = shapeData[i];
			
			return {
			    id: shape.id,
			    cells: headers.map(function(header, i) {
				var isColoured = header === getColourColumn(),
				    value = getShapeData(
					shape,
					header
				    ),
				    colour = isColoured ? colourCache.getColourFunction()(value) : null,
				    textColour = isColoured ? reverseColour(colour) : null;
				
				return {
				    value: value,
				    width: columnSizes.byIndex(i),
				    colour: colour,
				    textColour: textColour
				};
			    })
			};
		    });
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
			columnData = getColumnData(p);

		    if (columnData.length < bins) {
			return columnData;
		    }
		    
		    if (cooerceNumerics.isNumeric(p)) {
			columnData = columnData.map(parseFloat);
			
			return bin(
			    _.min(columnData),
			    _.max(columnData),
			    bins
			);
			
		    } else {
			return columnData;
		    }
		}
	    },

	    sortPropertyChanged: sortPropertyChanged.add,

	    baseColourChanged: baseColourChanged.add
	};
    };
};
