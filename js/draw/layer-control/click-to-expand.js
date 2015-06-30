"use strict";

/*global module, require*/

var d3 = require("d3"),
    expand = "«",
    contract = "»";

/*
 Given a d3 selection, add on-click to toggle expand/contract behaviour and a button indicating what will happen.
 */
module.exports = function(selection) {
    selection
	.style("overflow", "hidden")
	.style("height", "1em")
	.on("click", function(d, i) {
	    if (expander.text() === expand) {
		expander.text(contract);
		d3.select(this)
		    .style("height", null);
		
	    } else {
		expander.text(expand);
		d3.select(this)
		    .style("height", "1em");
	    }
	});

    var expander = selection
	    .append("span")
	    .classed("expander", true)
	    .text(expand);
};
