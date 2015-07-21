"use strict";

/*global module, require*/

var d3 = require("d3"),
    empty = d3.select();

module.exports = function(leftPane, rightPane, buttonContainer, visibleByDefault) {
    var hidden = !visibleByDefault,
	drawn = false,

	button = buttonContainer.append("div")
	    .classed("open-button", true)
	    .on("click", function() {
		hidden = !hidden;
		update();
	    }),

	update = function() {
	    leftPane.classed("contracted", !hidden);
	    rightPane.classed("element-hidden", hidden);
	    button.classed("element-hidden", hidden);
	};

    rightPane
	.classed("slide-out", true);

    update();

    return {
	/*
	 Designed to look a bit like the d3 update pattern;
	 */
	drawContent: function(contentFunction, buttonContentFunction) {
	    if (drawn) {
		contentFunction(rightPane, empty);
		buttonContentFunction(button, empty);
		
	    } else {
		contentFunction(rightPane, rightPane);
		buttonContentFunction(button, button);
		drawn = true;
	    }
	},

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
