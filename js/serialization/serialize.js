"use strict";

/*global module, require*/

var _ = require("lodash"),
    leaflet = require("leaflet"),
    helpers = require("../helpers.js"),
    asNum = helpers.asNum;

/*
 Converts between the state of the world (as defined in state.js) and data transfer objects which can be turned into JSON and sent out across the wire.
 */
module.exports = function(serializeShapeLayer, deserializeShapeLayer, deserializeTileLegend, sidePanel, bottomPanel, freshState) {
    var serializeShapeLayers = function(layers) {
	    var result = {};
	    
	    layers.all().forEach(function(layer) {
		result[layer.name()] = serializeShapeLayer(layer);
	    });

	    return result;
	},

	deserializeShapeLayers = function(shapeLayers, serializedLayers) {
	    Object.keys(serializedLayers).forEach(function(layerName) {
		var layerData = serializedLayers[layerName];
		deserializeShapeLayer(shapeLayers, layerName, layerData);
	    });
	},

	serializeTileLayers = function(tileLayers) {
	    var overlays = {};

	    tileLayers.overlays.forEach(function(name, overlay) {
		overlays[name] = {
		    opacity: overlay.getOpacity()
		};

		if (overlay.legend) {
		    overlays[name].legend = overlay.legend.dialogueState.serialize();
		}
	    });
	    
	    return {
		base: tileLayers.getBaseLayer().name(),
		baseOpacity: tileLayers.getBaseLayer().getOpacity(),
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
			    if (tileLayers.availableOverlays.has(overlayName)) {
				tileLayers.addOverlay(overlayName);
				
				var overlay = tileLayers.overlays.get(overlayName),
				    serializedOverlay = serialized.overlays[overlayName];

				if (serializedOverlay.opacity) {
				    overlay.setOpacity(asNum(serializedOverlay.opacity));
				}

				if (serializedOverlay.legend && overlay.legend) {
				    overlay.legend.dialogueState = deserializeTileLegend(
					serializedOverlay.legend
				    );
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
		shapeLayers: serializeShapeLayers(state.shapeLayers),
		shapeLayerOrder: state.shapeLayers.getOrder(),
		tileLayers: serializeTileLayers(state.tileLayers),
		viewport: serializeViewport(state.viewport),
		sidePanel: sidePanel.save(),
		bottomPanel: bottomPanel.save()		
	    };
	},

	deserializeViewport: deserializeViewport,
	serializeViewport: serializeViewport,

	deserialize: function(serialized) {
	    var state = freshState();

	    if (serialized.bottomPanel) {
		state.bottomPanel = serialized.bottomPanel;
	    }

	    if (serialized.sidePanel) {
		state.sidePanel = serialized.sidePanel;
	    }

	    if (serialized.tileLayers) {
		deserializeTileLayers(state.tileLayers, serialized.tileLayers);
	    }

	    if (serialized.shapeLayers) {
		deserializeShapeLayers(state.shapeLayers, serialized.shapeLayers);
	    }

	    if (serialized.shapeLayerOrder) {
		state.shapeLayers.setOrder(serialized.shapeLayerOrder);
	    }

	    if (serialized.viewport) {
		deserializeViewport(state.viewport, serialized.viewport);
	    }

	    return state;
	}
    };
};
