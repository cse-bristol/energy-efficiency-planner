"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler,
    layersFactory = require("./layers.js"),
    tileLayersFactory = require("./tile-layers.js");

/*
 Bundles together all aspect of the state of the map into a Javascript object.
 */
module.exports = function(errors, map, toolbar) {
    var onSet = callbacks(),
	layers,
	tileLayers,
	baseLayer,
	startCoordinates,
	startZoom,
	
	fresh = function() {
	    var t = tileLayersFactory(map.getZoom, errors);
	    
	    return {
		layers: layersFactory(errors),
		tileLayers: t,
		startCoordinates: leaflet.latLng(0, 0),
		startZoom: 2,
		tools: {
		    "L": true,
		    "!": false
		}
	    };
	};
    
    return {
	get: function() {
	    return {
		layers: layers,
		tileLayers: tileLayers,
		startCoordinate: startCoordinates,
		startZoom: startZoom,
		tools: toolbar.visibility()
	    };
	},

	getLayers: function() {
	    return layers;
	},

	getTileLayers: function() {
	    return tileLayers;
	},


	set: function(state) {
	    layers = state.layers;
	    tileLayers = state.tileLayers;
	    
	    map.eachLayer(function(layer) {
		map.removeLayer(layer);
	    });
	    
	    map.addLayer(tileLayers.getBaseLayer());
	    tileLayers.getBaseLayer().onSetOpacity(update);
	    
	    tileLayers.onSetBaseLayer(function(oldBaseLayer, baseLayer) {
		map.removeLayer(oldBaseLayer);
		map.addLayer(baseLayer);

		baseLayer.onSetOpacity(update);
		update();
	    });

	    tileLayers.overlays.forEach(function(name, layer) {
		map.addLayer(layer);
		layer.onSetOpacity(update);
	    });

	    Object.keys(state.visibility)
		.forEach(function(tool) {
		    var vis = state.visibility[tool];

		    if (vis !== undefined) {
			if (vis) {
			    toolbar.show(tool);
			} else {
			    toolbar.hide(tool);
			}
		    }
		});

	    startCoordinates = state.startCoordinates;
	    startZoom = state.startZoom;
	    
	    map.setView(
		state.startCoordinates,
		state.startZoom
	    );

	    onSet();
	},

	onSet: onSet.add,

	fresh: fresh
    };
};
