"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    helpers = require("./helpers.js"),
    asNum = helpers.asNum;

/*
 Converts between the state of the world (as defined in state.js) and data transfer objects which can be turned into JSON and sent out across the wire.
 */
module.exports = function(errors, freshState) {
    var serializeShapeLayers = function(layers) {
	return layers.all().map(function(layer) {
	    return {
		name: layer.name,
		opacity: layer.options.opacity,
		z: layer.options.zIndex
	    };
	});
    };

    var deserializeShapeLayers = function(layers, serializedLayers) {
	serializedLayers.forEach(function(serializedLayer) {
	    // TODO go and fetch these from the database.
	});
    };

    var serializeTileLayers = function(tileLayers) {
	return {
	    base: tileLayers.getBaseLayer().name(),
	    baseOpacity: tileLayers.getBaseLayer().options.opacity,
	    overlays: tileLayers.overlays.values()
		.map(function(overlay) {
		    return {
			name: overlay.name(),
			opacity: overlay.options.opacity
		    };
		})
	};
    };

    var deserializeTileLayers = function(tileLayers, serialized) {
	if (serialized.base) {
	    if (tileLayers.base.has(serialized.base)) {
		var base = tileLayers.base.get(serialized.base);
		tileLayers.setBaseLayer(base);
	    }
  	}
	
	if (serialized.baseOpacity) {
	    tileLayers.getBaseLayer().setOpacity(asNum(serialized.baseOpacity));
	}

	if (serialized.overlays) {
	    serialized.overlays.forEach(
		function(serializedOverlay) {
		    var name = serializedOverlay.name;
		    if (tileLayers.overlays.has(name)) {
			var overlay = tileLayers.overlays.get(name);

			if (serializedOverlay.opacity) {
			    overlay.setOpacity(asNum(serializedOverlay.opacity));
			}
		    }
		}
	    );
	}
	
    };

    return {
	serialize: function(state) {
	    return {
		layers: serializeShapeLayers(state.layers),
		tileLayers: serializeTileLayers(state.tileLayers),
		startCoordinates: [state.startCoordinates.lat, state.startCoordinates.lng],
		startZoom: state.startZoom,
		tools: state.tools
	    };
	},

	deserialize: function(serialized) {
	    var state = freshState();

	    if (serialized.tileLayers) {
		deserializeTileLayers(state.tileLayers, serialized.tileLayers);
	    }

	    if (serialized.shapeLayers) {
		deserializeShapeLayers(state.layers, serialized.shapeLayers);
	    }

	    if (serialized.startCoordinates) {
		state.startCoordinates = leaflet.latLng(
		    asNum(serialized.startCoordinates[0]),
		    asNum(serialized.startCoordinates[1]));
	    }

	    if (serialized.startZoom) {
		state.startZoom = asNum(serialized.startZoom);
	    }

	    if (serialized.tools) {
		state.tools = serialized.tools;
	    }

	    return state;
	}
    };
};
