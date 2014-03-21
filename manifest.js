"use strict";

/*global d3, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.manifest = function(file, errors, loader, geometry, layers, sources) {

    loader.load(file, d3.json, function(data, error) {
	if (error) {
	    errors.warnUser("Couldn't load manifest file " + file + " because " + error);
	    return;
	}

	d3.map(data).entries().forEach(function(l){
	    var layerName = l.key;
	    var props = d3.map(l.value);

	    if (!props.has("shape")) {
		errors.warnUser("Could not load layer " + layerName + " because it did not have a shape.");
		return;
	    }

	    loader.load(props.get("shape"), d3.json, function(data, error) {
		if (error) {
		    errors.warnUser(
			"Failed to load shape for layer " + layerName + " because of " + error);
		    return;
		}

		var layer = layers.create(layerName, geometry.fromTopoJSON(layerName, data));

		props.entries().forEach(function(e){
		    var prop = e.key;

		    if (prop !== "shape") {
			loader.load(e.value, d3.tsv, function(data, error){
			    if (error) {
				errors.warnUser(
				    "Failed to load property " + prop + " for layer " + layerName + " because of " + error);
				return;
			    }

			    layer.addSource(
				sources.fromTable(prop, data, layerName + ": " + prop)
			    );
			});
		    };
		});
	    });
	});
    });
};
