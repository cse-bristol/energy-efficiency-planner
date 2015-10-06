"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    layersFactory = require("./shape-layers/shape-layers-collection.js"),
    tileLayersFactory = require("./tile-layers.js"),
    viewpointFactory = require("../viewpoint.js"),
    helpers = require("../helpers.js"),
    callbacks = helpers.callbackHandler;

/*
 Bundles together all aspect of the state of the map into a Javascript object.
 */
module.exports = function(errors, map, sidePanel, bottomPanel, update) {
    var shapeLayers = layersFactory(errors),
	tileLayers = tileLayersFactory(map.getZoom),
	baseLayer,
	viewpoint = viewpointFactory(),
	onSet = callbacks(),
	loading = false,
	
	fresh = function() {
	    var t = tileLayersFactory(map.getZoom);
	    
	    return {
		shapeLayers: layersFactory(errors),
		tileLayers: t,
		viewpoint: viewpointFactory()
	    };
	};
    
    return {
	get: function() {
	    return {
		shapeLayers: shapeLayers,
		tileLayers: tileLayers,
		viewpoint: viewpoint
	    };
	},

	getShapeLayers: function() {
	    return shapeLayers;
	},

	getTileLayers: function() {
	    return tileLayers;
	},

	getViewpoint: function() {
	    return viewpoint;
	},

	set: function(state) {
	    loading = true;

	    try {
		sidePanel.load(state.sidePanel);
		bottomPanel.load(state.bottomPanel);

		shapeLayers = state.shapeLayers;
		tileLayers = state.tileLayers;

		map.eachLayer(function(layer) {
		    map.removeLayer(layer);
		});
		
		tileLayers.overlays.forEach(function(name, layer) {
		    map.addLayer(layer);
		});

		viewpoint = state.viewpoint;
		
		onSet(state);
		update();
	    } finally {
		loading = false;
	    }
	},

	fresh: fresh,

	onSet: onSet.add,

	loading: function() {
	    return loading;
	}
    };
};
