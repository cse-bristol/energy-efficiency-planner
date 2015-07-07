"use strict";

/*global module, require*/

var d3 = require("d3"),
    noDrag = require("../helpers.js").noDrag,
    opacityClass = "opacity-slider";

/*
 Given a selection for which the data is an id of a layer, add an input slider to control its opacity.
 */
module.exports = function(getLayer, update) {
    return function(selection, newSelection) {
	newSelection.append("input")
	    .classed(opacityClass, true)
	    .attr("type", "range")
	    .attr("min", 0)
	    .attr("max", 1)
	    .attr("step", 0.05)
	    .on("click", function(d, i) {
		d3.event.stopPropagation();
	    })
	    .on("input", function(d, i) {
		getLayer(d).setOpacity(this.value);
		update();
	    })
	    .call(noDrag);

	selection.select("." + opacityClass)
	    .each(function(d, i) {
		this.value = getLayer(d).getOpacity();
	    });
    };
};
