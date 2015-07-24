"use strict";

/*global module, require*/

/*
 Provides a widget from which layers in the map may be adjusted. Divided into:
 + Tiled base layers
 + Tiled overlays
 + Shape overlays

 One base layer may be selected at a time. There is one opacity slider the base layer.
 Overlays have individual opacity sliders.
 Shape overlays may be added and removed.
 Shape overlays may be clicked on to zoom to their current location.
 */

var d3 = require("d3"),
    leaflet = require("leaflet"),

    allFactory = require("./all-layers-control.js"),
    activeFactory = require("./active-layers-control.js"),
    baseFactory = require("./base-layers-control.js"),
    
    empty = d3.select();

module.exports = function(allContainer, activeContainer, baseContainer, updateTileLegendButtons, updateShapeLegendButtons, updateResultsTableButtons, getTileLayers, getShapeLayers, fetchShapeLayer, shapeLayerFactory, onSetState, zoomTo, search, errors, update) {
    var all = allFactory(allContainer, getTileLayers, getShapeLayers, fetchShapeLayer, shapeLayerFactory, search, errors, update),
	active = activeFactory(updateTileLegendButtons, updateShapeLegendButtons, updateResultsTableButtons, getTileLayers, getShapeLayers, activeContainer, zoomTo, update),
	base = baseFactory(getTileLayers, baseContainer, update);

    return {
	update: function() {
	    var tileLayers = getTileLayers(),
		shapeLayerNames = getShapeLayers().ordered()
		    .map(function(layer) {
			return layer.name();
		    });

	    all.update(
		tileLayers.overlays.keys(),
		shapeLayerNames		
	    );
	    active.update(
		tileLayers.overlays,
		shapeLayerNames
	    );
	    base.update(tileLayers.getBaseLayer(), tileLayers.base.keys());
	}
    };
};
