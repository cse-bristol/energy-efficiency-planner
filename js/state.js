"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    layersFactory = require("./layers.js"),
    tileLayersFactory = require("./tile-layers.js"),
    viewportFactory = require("./viewport.js"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler;

/*
 Bundles together all aspect of the state of the map into a Javascript object.
 */
module.exports = function(errors, map, toolbar, tableForLayer, update) {
    var layers,
	tileLayers,
	baseLayer,
	viewport,
	onSet = callbacks(),
	loading = false,
	
	fresh = function() {
	    var t = tileLayersFactory(map.getZoom, errors);
	    
	    return {
		layers: layersFactory(errors),
		tileLayers: t,
		viewport: viewportFactory(),

		tools: {
		    "L": true,
		    "!": false,
		    "I": false,
		    "l": false
		}
	    };
	},
	cleanUp = function() {
	    if (layers) {
		/*
		 Clean out these now unhelpful elements.
		 */
		layers.all().forEach(function(l) {
		    l.resultsTable.el().remove();
		});
	    }
	};
    
    return {
	get: function() {
	    return {
		layers: layers,
		tileLayers: tileLayers,
		viewport: viewport,
		tools: toolbar.visibility()
	    };
	},

	getLayers: function() {
	    return layers;
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
