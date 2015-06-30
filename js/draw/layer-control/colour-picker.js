"use strict";

/*global module, require*/

var d3 = require("d3"),
    colours = require("slippy-colors");

/*
 Adds a colour picker to the layer control for each shape layer.

 shapes and newShapes are d3 selections. They have the names of layers as their data.
 */
module.exports = function(shapes, newShapes, getShapeLayerById) {
    var newColours = newShapes.append("span")
	    .classed("choose-colour", true);
    
    newColours.append("span")
	.classed("colour-picker", true)
    /*
     The slippy-colors colour picker only knows how to handle a selection of one element at a time, so we have to use each.
     */
	.each(function(d, i) {
	    var that = d3.select(this)
	    	    .call(
			colours()
	      		    .width(100)
			    .height(100)
			    .on("mouseup", function(colour) {
				var p = d3.select(
				    that.node().parentElement
				);
				
				p.select(".colour-indicator")
				    .style("background-color", colour);

				getShapeLayerById(p.datum())
				    .worksheet
				    .setBaseColour(colour);
			    }));
	})
	.on("click", function(d, i) {
	    d3.event.stopPropagation();
	});
    
    newColours.append("span")
	.classed("colour-indicator", true)
	.html("&nbsp;");

    shapes.select(".choose-colour")
	.select(".colour-indicator")
	.style("background-color", function(d, i) {
	    return getShapeLayerById(d)
		.worksheet
		.baseColour();
	});
};
