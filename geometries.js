"use strict";

/*global d3, topojson, Shapefile, DBF, OpenDataMap */

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
	manyFromTopoJSON : function(data){
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
	    return data.features;
	},
	fromShapefile : function(shapeData, dbfData) {
	    var s = Shapefile(shapeData);
	    var d = DBF(dbfData);
	    s.addDBFDataToGeoJSON(d); 
	    return s.geojson.features;
	}
    };
};
