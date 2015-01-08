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
    },

	serializeShapeLayer = function(layer) {
	    var table = layer.resultsTable.dialogue();

	    return {
		opacity: layer.options.opacity,
		z: layer.options.zIndex,
		colour: layer.worksheet.baseColour(),
		sort: layer.worksheet.getSortProperties(),
		table: serializeResultsTable(layer.resultsTable.dialogue())
	    };
	},
	
	serializeShapeLayers = function(layers) {
	    var result = {};
	    
	    layers.all().forEach(function(layer) {
		result[layer.name()] = serializeShapeLayer(layer);
	    });

	    return result;
	},

	deserializeShapeSort = function(serialized, setSortProperty) {
	    _.zip(serialized.properties, serialized.reverse)
		.forEach(function(sort, i) {

		    setSortProperty(
			sort[0],
			/*
			 The first property in the list replaces any existing sort.
			 */
			i !== 0
		    );
		    
		    /*
		     In order to reverse the sort order, sort again by the same property.
		     */
		    if (sort[1]) {
			setSortProperty(sort[1], true);
		    }
		});
	},

	deserializeShapeLayer = function(layers, layerName, layerData) {
	    /*
	     Schedule the layer's geometry to be loaded from the database. When it is, fill in the created layer.
	     */
	    onDeserializeLayer(layers, layerName, function(layer) {
		layer.setOpacity(layerData.opacity);
		layer.setZIndex(layerData.z);
		layer.worksheet.baseColour(layerData.colour);

		var first = true;
		deserializeShapeSort(layerData.sort, layer.worksheet.sortProperty);
		
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
	},

	deserializeShapeLayers = function(layers, serializedLayers) {
	    Object.keys(serializedLayers).forEach(function(layerName) {
		var layerData = serializedLayers[layerName];
		deserializeShapeLayer(layers, layerName, layerData);
	    });
	},

	serializeTileLayers = function(tileLayers) {
	    var overlays = {};

	    tileLayers.overlays.forEach(function(name, overlay) {
		overlays[name] = {
		    opacity: overlay.options.opacity
		};
	    });
	    
	    return {
		base: tileLayers.getBaseLayer().name(),
		baseOpacity: tileLayers.getBaseLayer().options.opacity,
		overlays: overlays
	    };
	},

	deserializeTileLayers = function(tileLayers, serialized) {
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
		Object.keys(serialized.overlays)
		    .forEach(
			function(overlayName) {
			    if (tileLayers.overlays.has(overlayName)) {
				var overlay = tileLayers.overlays.get(overlayName),
				    serializedOverlay = serialized.overlays[overlayName];

				if (serializedOverlay.opacity) {
				    overlay.setOpacity(asNum(serializedOverlay.opacity));
				}
			    }
			}
		    );
	    }
	    
	},

	serializeViewport = function(viewport) {
	    return {
		coordinates: [viewport.lat(), viewport.lng()],
		zoom: viewport.zoom()
	    };
	},

	deserializeViewport = function(viewport, serialized) {
	    viewport.set(
		leaflet.latLng(serialized.coordinates),
		serialized.zoom
	    );
	};

    return {
	serialize: function(state) {
	    return {
		shapeLayers: serializeShapeLayers(state.layers),
		tileLayers: serializeTileLayers(state.tileLayers),
		viewport: serializeViewport(state.viewport),
		tools: state.tools
	    };
	},

	deserializeShapeSort: deserializeShapeSort,
	deserializeShapeLayer: deserializeShapeLayer,
	serializeShapeLayer: serializeShapeLayer,

	deserializeViewport: deserializeViewport,
	serializeViewport: serializeViewport,

	deserialize: function(serialized) {
	    var state = freshState();

	    if (serialized.tileLayers) {
		deserializeTileLayers(state.tileLayers, serialized.tileLayers);
	    }

	    if (serialized.shapeLayers) {
		deserializeShapeLayers(state.layers, serialized.shapeLayers);
	    }

	    if (serialized.viewport) {
		deserializeViewport(state.viewport, serialized.viewport);
	    }

	    if (serialized.tools) {
		state.tools = serialized.tools;
	    }

	    return state;
	},

	onDeserializeLayer: onDeserializeLayer.add
    };
};
