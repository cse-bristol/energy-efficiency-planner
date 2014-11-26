"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    layersFactory = require("./layers.js"),
    tileLayersFactory = require("./tile-layers.js"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler;

/*
 Bundles together all aspect of the state of the map into a Javascript object.
 */
module.exports = function(errors, map, toolbar, tableForLayer, update) {
    var layers,
	tileLayers,
	baseLayer,
	startCoordinates,
	startZoom,
	onSet = callbacks(),
	
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
	},
	cleanUp = function() {
	    if (layers) {
		/*
		 Clean out existing layers.
		 */
		layers.all().forEach(function(l) {
		    l.remove();
		});
	    }
	};
    
    return {
	get: function() {
	    return {
		layers: layers,
		tileLayers: tileLayers,
		startCoordinates: startCoordinates,
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
	    cleanUp();
	    
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

		oldBaseLayer.clearOnSetOpacity();
		baseLayer.onSetOpacity(update);
		update();
	    });

	    tileLayers.overlays.forEach(function(name, layer) {
		map.addLayer(layer);
		layer.onSetOpacity(update);
	    });

	    var setupLayer = function(layer) {
		tableForLayer(layer);
		layer.onRemove(update);
	    };
	    
	    layers.all().forEach(setupLayer);

	    layers.onCreate(setupLayer);
	    layers.onCreate(update);

	    layers.onReorder(update);

	    Object.keys(state.tools)
		.forEach(function(tool) {
		    var vis = state.tools[tool];

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
	    update();
	},

	fresh: fresh,

	onSet: onSet.add
    };
};
