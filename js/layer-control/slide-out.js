"use strict";

/*global module, require*/

var d3 = require("d3"),
    empty = d3.select();

/*
 The left pane will be contracted when the right pane is visible, and expanded when it is hidden.
 */
module.exports = function(leftPane, rightPane, button, visibleByDefault) {
    var hidden = !visibleByDefault,

	update = function() {
	    leftPane.classed("contracted", !hidden);
	    rightPane.classed("element-hidden", hidden);
	    button.classed("element-hidden", hidden);
	};

    rightPane
	.classed("slide-out", true);
    
    button
	.classed("open-button", true)
	.on("click", function() {
	    hidden = !hidden;
	    update();
	}),    

    update();

    return {
	setVisibility: function(visibility) {
	    hidden = !visibility;
	    update();
	},

	getVisibility: function() {
	    return !hidden;
	},

	reset: function() {
	    hidden = !visibleByDefault;
	}
    };
};
