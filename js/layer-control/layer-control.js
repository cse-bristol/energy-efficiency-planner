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
    
    activeFactory = require("./active-layers-control.js"),
    baseFactory = require("./base-layers-control.js"),
    
    empty = d3.select();

module.exports = function(activeContainer, baseContainer, updateTileLegendButtons, updateShapeLegendButtons, updateResultsTableButtons, getTileLayers, getShapeLayers, onSetState, zoomTo, update) {
    var active = activeFactory(updateTileLegendButtons, updateShapeLegendButtons, updateResultsTableButtons, getTileLayers, getShapeLayers, activeContainer, zoomTo, update),
	base = baseFactory(getTileLayers, baseContainer, update);

    return {
	update: function() {
	    var tileLayers = getTileLayers(),
		shapeLayers = getShapeLayers().ordered();

	    active.update(
		tileLayers.overlays,
		shapeLayers.map(function(layer) {
		    return layer.name();
		})
	    );
	    base.update(tileLayers.getBaseLayer(), tileLayers.base.keys());
	}
    };
};
