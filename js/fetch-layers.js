"use strict";

/*global module, require*/

var d3 = require("d3"),
    collection = "shape-layers";

/*
 If we add a layer to a map, it will get saved in a collection (overwriting any existing layer of the same name).
 */
module.exports = function(isUp, waitForConnection, load, onDeserializeLayer, getLayers) {
    var loadLayer = function(layerName, callback) {
	if (isUp()) {
	    load(
		collection,
		layerName,
		function(loaded) { 
		    var snapshot = loaded.getSnapshot();
		    if (snapshot) {
			callback(snapshot.geometry, snapshot.boundingbox);
		    } else {
			throw new Error("Attempted to load Layer which does not exist " + layerName);
		    }
		}
	    );
	} else {
	    throw new Error("Cannot load layer " + layerName + ": the server is down.");
	}
    };

    var saveLayer = function(layer) {
	waitForConnection(function() {
	    load(
		collection,
		layer.name(),
		function(loaded) {
		    var snapshot = loaded.getSnapshot();
		    if (snapshot) {
			loaded.del();
		    }

		    loaded.create("json0", {
			geometry: layer.geometry(),
			boundingbox: layer.boundingbox()
		    });
		});
	});
    };
    
    onDeserializeLayer(loadLayer);

    return {
	/*
	 Retrieves a layer from the server by name and adds it to a layers collection.

	 Runs a callback against it.
	 */
	load: loadLayer,

	/*
	 Schedules the layer to be saved next time we are able to talk to the server.
	 */
	save: saveLayer,

	collection: collection
    };
};
