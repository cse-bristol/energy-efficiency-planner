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
    
    slideOutFactory = require("./slide-out.js"),
    tabsFactory = require("./tabs.js"),

    activeFactory = require("./active-layers-control.js"),
    baseFactory = require("./base-layers-control.js"),
    
    empty = d3.select(),
    toolText = "L",

    allTab = "All",
    activeTab = "Active",
    baseTab = "Base",
    uploadTab = "Upload";

module.exports = function(leftPane, rightPane, toolbar, updateTileLegendButtons, updateShapeLegendButtons, updateResultsTableButtons, getTileLayers, getShapeLayers, onSetState, zoomTo, update, errors) {
    rightPane.append("h3")
	.text("Layers");
    
    var slideOut = slideOutFactory(
	    leftPane,
	    rightPane
		.attr("id", "layer-control"),
	    toolbar.append("div")
		.text(toolText),
	    false
	),

	tabs = tabsFactory(
	    rightPane,
	    [
		allTab,
		activeTab,
		baseTab,
		uploadTab
	    ],
	    activeTab,
	    errors
	),

	active = activeFactory(updateTileLegendButtons, updateShapeLegendButtons, updateResultsTableButtons, getTileLayers, getShapeLayers, tabs.get(activeTab), zoomTo, update),
	base = baseFactory(getTileLayers, tabs.get(baseTab), update);

    onSetState(function(state) {
	if (state.layerControl) {
	    if (state.layerControl.visible !== undefined) {
		slideOut.setVisibility(state.layerControl.visible);
	    } else {
		slideOut.reset();
	    }

	    if (state.layerControl.tab) {
		tabs.setCurrentTab(state.layerControl.tab);
	    } else {
		tabs.reset();
	    }
	} else {
	    slideOut.reset();
	    tabs.reset();
	}
    });

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

	},
	save: function() {
	    return {
		visible: slideOut.getVisibility(),
		tab: tabs.getCurrentTab()
	    };
	}
    };
};
