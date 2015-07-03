"use strict";

/*global module, require*/

var _ = require("lodash"),
    d3 = require("d3"),
    helpers = require("../../../helpers.js"),
    isNum = helpers.isNum,
    asNum = helpers.asNum;

/*
 *** This class modifies the shape data put in to it. ***

 For each property on the layer, records whether it is numeric.

 If it is numeric, cooerces it to be of number type (instead of string).
*/
module.exports = function(rawShapeData, headers, getColumnData) {
    var isNumeric = d3.map();

    headers.forEach(function(header) {
	isNumeric.set(
	    header,
	    _.all(
		getColumnData(header),
		isNum
	    )
	);

	if (isNumeric.get(header)) {
	    rawShapeData.forEach(function(shape) {
		shape.properties[header] = asNum(shape.properties[header]);
	    });
	}
    });
    
    return {
	isNumeric: _.bind(isNumeric.get, isNumeric)
    };
};
