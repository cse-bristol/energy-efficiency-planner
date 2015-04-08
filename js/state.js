"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    layersFactory = require("./shape-layers/shape-layers-collection.js"),
    tileLayersFactory = require("./tile-layers.js"),
    viewportFactory = require("./viewport.js"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler;

/*
 Bundles together all aspect of the state of the map into a Javascript object.
 */
module.exports = function(errors, map, toolbar, tableForLayer, update) {
    var shapeLayers,
	tileLayers,
	baseLayer,
	viewport,
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
		    "I": {visibility: false},
		    "l": {visibility: false}
		}
	    };
	},
	cleanUp = function() {
	    if (shapeLayers) {
		/*
		 Clean out these now unhelpful elements.
		 */
		shapeLayers.all().forEach(function(l) {
		    l.resultsTable.remove();
		});
	    }
	};
    
    return {
	get: function() {
	    return {
		shapeLayers: shapeLayers,
		tileLayers: tileLayers,
		viewport: viewport,
		tools: toolbar.getState()
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
		cleanUp();
		
		shapeLayers = state.shapeLayers;
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

		shapeLayers.all().forEach(tableForLayer);
		shapeLayers.onAdd(tableForLayer);
		shapeLayers.onAdd(update);
		shapeLayers.onRemove(function(layer) {
		    layer.resultsTable.remove();
		    update();
		});
		shapeLayers.onReorder(update);

		if (state.tools) {
		    toolbar.setState(state.tools);
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
