"use strict";

/*global module, require*/

var d3 = require("d3"),
    noDrag = require("../helpers.js").noDrag,
    sortColumn1 = "<sort column 1>";

/*
 Adds a dropdown box asking which column to use for colour to the layers control for each shape layer.
 */
module.exports = function(shapes, newShapes, getShapeLayers) {
    var layers = getShapeLayers(),
	
	select = newShapes.append("select")
	    .classed("colour-column-picker", true)
	    .on("change", function(d, i) {
		getShapeLayers()
		    .get(d)
		    .worksheet
		    .setColourColumn(
			this.children[
			    this.selectedIndex
			].value
		    );
	    })
	    .on("click", function(d, i) {
		d3.event.stopPropagation();
	    })
	    .call(noDrag),
	

	options = select.selectAll("option")
	    .data(
		function(d, i) {
		    return [
			sortColumn1
		    ].concat(
			layers.get(d).worksheet.headers()
		    );
		},
		function(d, i) {
		    return d;
		}
	    ),
	
	newOptions = options.enter()
	    .append("option")
	    .text(function(d, i) {
		return d;
	    });
};
