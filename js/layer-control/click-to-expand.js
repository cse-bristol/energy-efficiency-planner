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
	.classed("can-expand", true)
	.style("overflow", "hidden")
	.on("click", function(d, i) {
	    var current = d3.select(this),
		expanded = current.classed("expanded"),
		shouldExpand = !expanded;

	    current
		.classed("expanded", shouldExpand)
		.select(".expander")
		.text(shouldExpand ? contract : expand);
	});

    selection
	.append("span")
	.classed("expander", true)
	.text(expand);
};
