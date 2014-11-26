"use strict";

/*global module, require*/

var _ = require("lodash"),
    leaflet = require("leaflet"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler,
    asNum = helpers.asNum;

/*
 Converts between the state of the world (as defined in state.js) and data transfer objects which can be turned into JSON and sent out across the wire.
 */
module.exports = function(errors, freshState) {
    var onDeserializeLayer = callbacks();

    var serializeResultsTable = function(table) {
	var result = {
	    visible: table.visible()
	};

	if (table.manuallySized()) {
	    result.size = table.size();
	}
	if (table.manuallyPositioned()) {
	    result.position = table.position();
	}

	return result;
    };
    
    var serializeShapeLayers = function(layers) {
	var result = {};
	
	layers.all().forEach(function(layer) {
	    var table = layer.resultsTable.dialogue();

	    result[layer.name()] = {
		opacity: layer.options.opacity,
		z: layer.options.zIndex,
		colour: layer.worksheet.baseColour(),
		sort: layer.worksheet.getSortProperties(),
		table: serializeResultsTable(layer.resultsTable.dialogue())
	    };
	});

	return result;
    };

    var deserializeShapeLayers = function(layers, serializedLayers) {
	Object.keys(serializedLayers).forEach(function(layerName) {
	    var layerData = serializedLayers[layerName];

	    /*
	     Schedule the layer's geometry to be loaded from the database. When it is, fill in the created layer.
	     */
	    onDeserializeLayer(layers, layerName, function(layer) {
		layer.setOpacity(layerData.opacity);
		layer.setZIndex(layerData.z);
		layer.worksheet.baseColour(layerData.colour);

		var first = true;
		_.zip(layerData.sort.properties, layerData.sort.reverse)
		    .forEach(function(sort) {
			layer.worksheet.sortProperty(sort[0], true);

			/*
			 In order to reverse the sort order, sort again by the same property.
			 */
			if (sort[1]) {
			    layer.worksheet.sortProperty(sort[1], true);
			}
		    });
		
		var table = layer.resultsTable.dialogue();
		if (layerData.table.visible) {
		    table.show();
		} else {
		    table.hide();
		}
		
		if (layerData.table.size !== undefined) {
		    table.size(layerData.table.size);
		}
		if (layerData.table.position !== undefined) {
		    table.position(layerData.table.position);
		}
	    });
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
		shapeLayers: serializeShapeLayers(state.layers),
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
	},

	onDeserializeLayer: onDeserializeLayer.add
    };
};
