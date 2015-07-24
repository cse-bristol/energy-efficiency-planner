"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    layersFactory = require("./shape-layers/shape-layers-collection.js"),
    tileLayersFactory = require("./tile-layers.js"),
    viewportFactory = require("../viewport.js"),
    helpers = require("../helpers.js"),
    callbacks = helpers.callbackHandler;

/*
 Bundles together all aspect of the state of the map into a Javascript object.
 */
module.exports = function(errors, map, sidePanel, bottomPanel, update) {
    var shapeLayers = layersFactory(errors),
	tileLayers = tileLayersFactory(map.getZoom),
	baseLayer,
	viewport = viewportFactory(),
	onSet = callbacks(),
	loading = false,
	
	fresh = function() {
	    var t = tileLayersFactory(map.getZoom);
	    
	    return {
		shapeLayers: layersFactory(errors),
		tileLayers: t,
		viewport: viewportFactory()
	    };
	};
    
    return {
	get: function() {
	    return {
		shapeLayers: shapeLayers,
		tileLayers: tileLayers,
		viewport: viewport
	    };
	},

	getShapeLayers: function() {
	    return shapeLayers;
	},

	getTileLayers: function() {
	    return tileLayers;
	},

	getViewport: function() {
	    return viewport;
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

		viewport = state.viewport;
		
		map.setView(
		    viewport.coordinates(),
		    viewport.zoom()
		);

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
