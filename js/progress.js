"use strict";

/*global module, require*/

var d3 = require("d3");

/*
 Modal window which blocks pointer events and shows the wait cursor.
 */
module.exports = function(body) {
    var mask = body
	    .append("div")
	    .attr("id", "loading-cursor-mask")
	    .style("display", "none")
	    .style("opacity", 0)
	    .style("cursor", "wait")
	    .style("z-index", 999)
	    .style("position", "fixed")
	    .style("top", 0)
	    .style("bottom", 0)
	    .style("left", 0)
	    .style("right", 0)
	    .style("margin", 0),

	depth = 0,

	update = function() {
	    if (depth < 0) {
		depth = 0;
	    }

	    if (depth) {
		mask.style("display", "block");
	    } else {
		mask.style("display", "none");
	    }
	};

    
    return {
	waiting: function() {
	    depth++;
	    update();
	},

	ready: function() {
	    depth--;
	    update();
	}
    };
};
