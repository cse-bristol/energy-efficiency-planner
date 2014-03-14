"use strict";

/*global d3, topojson, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 Given a manifest object, loads up geometry layers and flat files.
 These may then be requested by layer name.
 */
OpenDataMap.geometryData = function(loader, manifest) {
    var layersByName = d3.map({});
    /* These are the OpenData.source objects which were loaded as a result of the manifest. */
    var sourcesForLayers = d3.map({});
    var manifestCallbacks = [];

    d3.json(manifest, function(error, data){
	if (error) {
	    console.log("Couldn't load manifest " + error);
	}

	d3.map(data).entries().forEach(function(l){
	    var layerName = l.key;
	    var layer = OpenDataMap.layer(layerName);
	    
	    var props = d3.map(l.value);
	    sourcesForLayers.set(layerName, []);

	    layersByName.set(layerName, layer);
	    
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
			sourcesForLayers.get(layer.name()).push(
			    OpenDataMap.source.fromGeometry(topojsonShapes));

		    });
		} else {
		    loader.load(file, d3.tsv, function(rows){
			sourcesForLayers.get(layer.name()).push(
			    OpenDataMap.source.fromTimeSeries(prop, rows, layer.name() + "/" + prop)
			);
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
	 Loads the default sources for a named layer.
	 */
	defaultSources : function(layerName) {
	    return sourcesForLayers.get(layerName);
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


