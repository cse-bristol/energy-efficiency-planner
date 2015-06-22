"use strict";

/*global module, require*/

var d3 = require("d3");

/*
 Modal window which blocks pointer events and shows the wait cursor.
 */
module.exports = function(body) {
    var mask = body
	    .append("div")
	    .attr("id", "loading-cursor-mask"),

	depth = 0,

	update = function() {
	    if (depth < 0) {
		depth = 0;
	    }

	    if (depth) {
		mask.classed("loading", true);
	    } else {
		mask.classed("loading", false);
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
