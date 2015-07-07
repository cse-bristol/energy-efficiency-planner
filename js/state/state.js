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
module.exports = function(errors, map, update) {
    var shapeLayers = layersFactory(errors),
	tileLayers = tileLayersFactory(map.getZoom, errors),
	baseLayer,
	viewport = viewportFactory(),
	onSet = callbacks(),
	loading = false,
	
	fresh = function() {
	    var t = tileLayersFactory(map.getZoom, errors);
	    
	    return {
		shapeLayers: layersFactory(errors),
		tileLayers: t,
		viewport: viewportFactory(),

		tools: {
		    "L": {visibility: true},
		    "!": {visibility: false},
		    "I": {visibility: false}
		}
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
		shapeLayers = state.shapeLayers;
		tileLayers = state.tileLayers;

		map.eachLayer(function(layer) {
		    map.removeLayer(layer);
		});
		
		tileLayers.overlays.forEach(function(name, layer) {
		    map.addLayer(layer);
		});

		if (state.tools) {
		    // ToDo deserialize import, errors, layer control
		}

		viewport = state.viewport;
		
		map.setView(
		    viewport.coordinates(),
		    viewport.zoom()
		);

		onSet();
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
