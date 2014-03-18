"use strict";

/*global d3, topojson, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 A geometry is a geoJSON feature collection.
 This provides a number of functions to produce these.
 */
OpenDataMap.geometries = function() {
    return {
	fromTopoJSON : function(layerName, data){
	    var s = data.objects[layerName];
	    var topojsonShapes = topojson.feature(data, s);
	    if (topojsonShapes.features) {
		return topojsonShapes.features;
	    } else {
		return [topojsonShapes];
	    }
	},
	fromGeoJSON : function(data) {
	    throw "Not implemented";
	},
	fromShapeFile : function(data) {
	    throw "Not implemented";
	}
    };
};
