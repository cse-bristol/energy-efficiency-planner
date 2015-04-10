"use strict";

/*global module, require*/

var d3 = require("d3"),
    openLegendClass = "open-legend-button";

/*
 Creates a button to open the legend for each layer and connects it up to that layer's legend.

 Assumes that legends will be created before this is called, and that each layer will have a property called 'legend' which contains its legend dialogue.
 */
module.exports = function(selection, newSelection, getLayer) {
    newSelection.each(function(d, i) {
	var el = d3.select(this);
	
	el.append("span")
	    .classed(openLegendClass, true)
	    .text("K")
	    .each(function(d, i) {
		getLayer(d)
		    .legendDisplay
		    .open(
		d3.select(this));
	    });
    });
};
