"use strict";

/*global d3, topojson, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.geometryData = function(loader, manifest) {
    var layerProperties = d3.map({});
    var layerGeometry = d3.map({});
    var layerCallbacks = d3.map({});
    var manifestCallbacks = [];

    d3.json(manifest, function(error, data){
	if (error) {
	    console.log("Couldn't load manifest " + error);
	}

	d3.map(data).entries().forEach(function(l){
	    var layer = l.key;
	    var props = d3.map(l.value);

	    layerProperties.set(layer, d3.map({}));
	    layerCallbacks.set(layer, []);

	    props.entries().forEach(function(p){
		var prop = p.key;
		var file = p.value;

		if (prop === "shape") {
		    loader.load(file, d3.json, function(data) {
			var s = data.objects[layer];
			var topojsonShapes = topojson.feature(data, s);
			if (topojsonShapes.features) {
			    topojsonShapes = topojsonShapes.features;
			} else {
			    topojsonShapes = [topojsonShapes];
			}

			layerGeometry.set(layer, topojsonShapes);

			layerCallbacks.get(layer).forEach(function(callback){
			    callback(topojsonShapes);
			});

		    });
		} else {
		    loader.load(file, d3.tsv, function(rows){
			layerProperties.get(layer).set(prop, rows);
		    });
		}
	    });
	});

	manifestCallbacks.forEach(function(callback){
	    callback();
	});
    });
    
    var module = {
	/*
	 Returns a map name -> shape for all layers which have been loaded.
	 */
	layers : function() {
	    return layerGeometry;
	},
	/*
	 Returns the names of all the layers which were listed in the manifest.
	 */
	allLayerNames : function() {
	    return layerCallbacks.keys();
	},
	/*
	 Returns the properties for a named layer.
	 If these have not yet been loaded, it will return an empty list.
	 */
	layerProperties : function(layer) {
	    if (layerProperties.has(layer)) {
		return layerProperties.get(layer).keys();
	    } else {
		throw new Error("Unknown layer " + layer);
	    }
	},
	/*
	 If the named layer has loaded, runs the callback against its shapefile immediately.
	 Otherwise, schedules the callback to be run once the layer has loaded.
	 */
	onLayerGeometryLoaded : function(layer, callback) {
	    if (layerGeometry.has(layer)) {
		callback(layerGeometry.get(layer));
	    } else {
		layerCallbacks.get(layer).push(callback);
	    }
	},
	onManifestLoaded : function(callback) {
	    manifestCallbacks.push(callback);
	}
    };

    return module;
};


