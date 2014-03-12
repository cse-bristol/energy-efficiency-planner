"use strict";

/*global d3, topojson, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 Stores the layers.
 */
OpenDataMap.geometryData = function(loader, manifest) {
    var layersByName = d3.map({});
    var manifestCallbacks = [];

    d3.json(manifest, function(error, data){
	if (error) {
	    console.log("Couldn't load manifest " + error);
	}

	d3.map(data).entries().forEach(function(l){
	    var layer = OpenDataMap.layer(l.key);
	    var props = d3.map(l.value);

	    layersByName.set(l.key, layer);
	    
	    props.entries().forEach(function(p){
		var prop = p.key;
		var file = p.value;

		if (prop === "shape") {
		    loader.load(file, d3.json, function(data) {
			var s = data.objects[layer.name()];
			var topojsonShapes = topojson.feature(data, s);
			if (topojsonShapes.features) {
			    topojsonShapes = topojsonShapes.features;
			} else {
			    topojsonShapes = [topojsonShapes];
			}

			layer.geometry(topojsonShapes);

		    });
		} else {
		    loader.load(file, d3.tsv, function(rows){
			layer.addProperty(prop, rows);
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
	 Returns all the layers.
	 */
	layers : function() {
	    return layersByName.values();
	},
	/*
	 Returns the names of all the layers which were listed in the manifest.
	 */
	allLayerNames : function() {
	    return layersByName.keys();
	},
	layer : function(layerName) {
	    return layersByName.get(layerName);
	},
	/*
	 If the named layer has loaded, runs the callback against its shapefile immediately.
	 Otherwise, schedules the callback to be run once the layer has loaded.
	 */
	onLayerGeometryLoaded : function(layer, callback) {
	    layersByName.get(layer).onGeometryLoaded(callback);
	},
	onManifestLoaded : function(callback) {
	    manifestCallbacks.push(callback);
	}
    };

    return module;
};


