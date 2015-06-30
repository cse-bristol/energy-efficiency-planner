"use strict";

/*global module, require*/

var d3 = require("d3"),
    tableButtonClass = "open-table";

/*
 Creates a button to open the results-table for each layer and connects it up to that layer's results table.

 Assumes that tables will be created before this is called, and that each layer will have a property called 'resultsTable' which contains its table element.
 */
module.exports = function(selection, newSelection, getLayer) {
    newSelection.each(function(d, i) {
	d3.select(this)
	    .append("span")
	    .classed(tableButtonClass, true)
	    .text("⊞")
	    .each(function(d, i) {
		getLayer(d)
		    .resultsTable.dialogue().open(
			d3.select(this));
	    });
    });
};
