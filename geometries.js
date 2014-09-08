"use strict";

/*global module, require*/

var d3 = require("d3"),
    topojson = require("topojson"),
    proj4 = require("proj4"),
    dbf = require("./lib/js-shapefile-to-geojson/dbf.js"),
    shapefile = require("./lib/js-shapefile-to-geojson/shapefile.js"),
    isNum = require("./helpers.js").isNum;

var to = "WGS84";

var transform = function(from, o) {
    var proj = proj4(from, to);
    var bbox = function(box) {
	var a = proj.forward([box[0], box[1]]);
	var b = proj.forward([box[2], box[3]]);

	box[0] = a[0];
	box[1] = a[1];
	box[2] = b[0];
	box[3] = b[1];
    };

    var coordinates = function(c) {
	if (c.length === 2 && isNum(c[0]) && isNum(c[1])) {
	    var b = proj.forward(c);
	    c[0] = b[0];
	    c[1] = b[1];
	} else {
	    var len = c.length;
	    for (var i = 0; i < len; i++) {
		coordinates(c[i]);
	    }
	}
    };
    
    var obj = function(o) {
	if (o.bbox) {
	    bbox(o.bbox);
	}
	if (o.features) {
	    var len = o.features.length;
	    for (var i = 0; i < len; i++) {
		obj(o.features[i]);
	    }
	}
	if (o.geometry) {
	    obj(o.geometry);
	}
	if (o.geometries) {
	    len = o.geometries.length;
	    for (i = 0; i < len; i++) {
		obj(o.geometries[i]);
	    }
	}
	if (o.coordinates) {
	    coordinates(o.coordinates);
	}
    };

    obj(o);
};

/*
 A geometry is a geoJSON feature collection.
 This module provides a number of functions to produce these.
 */
module.exports = {
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
    fromShapefile : function(shapeData, dbfData, prj) {
	var s = shapefile(shapeData);
	var d = dbf(dbfData);
	s.addDBFDataToGeoJSON(d);

	if (prj) {
	    transform(prj, s.geojson);
	}

	return s.geojson;
    }
};

