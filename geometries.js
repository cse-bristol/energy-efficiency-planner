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
	
	manyFromTopoJSON : function(layerName, data){
	    var result = d3.map({});
	    
	    d3.map(data.objects).entries().forEach(function(e){
		var name = e.key;
		var s = e.value;
		var topojsonShapes = topojson.feature(data, s);
		if (topojsonShapes.features) {
		    result.set(name, topojsonShapes.features);
		} else {
		    result.set(name, [topojsonShapes]);
		}
	    });

	    return result;
	},	
	fromGeoJSON : function(data) {
	    throw "Not implemented";
	},
	fromShapeFile : function(data) {
	    throw "Not implemented";
	}
    };
};
