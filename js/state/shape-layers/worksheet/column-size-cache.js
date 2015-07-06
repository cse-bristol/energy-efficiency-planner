"use strict";

/*global module, require*/

/*
 Stores the widths of the columns in this layer.
 */
module.exports = function(shapeData, headers) {
    var sizes = [];

    headers.forEach(function(header, i) {
	var len = header.length;

	shapeData.forEach(function(shape) {
	    var value = shape.properties[header];
	    if (value !== undefined) {
		len = Math.max(
		    len,
		    ("" + value).length
		);
	    }
	});

	sizes[i] = len;
    });
    
    return {
	byIndex: function(i) {
	    return sizes[i];
	}
    };
};
