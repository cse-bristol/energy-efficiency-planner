"use strict";

/*global module, require*/

var float = require("floating-dialogue"),
    d3 = require("d3");

module.exports = function(bottomPanel) {
    var	hideNoErrors = function() {
	    noErrors.style("display", "none");
	},

	maybeShowNoErrors = function() {
	    if (bottomPanel.getContainer().node().childNodes.length <= 1) {
		noErrors.style("display", "block");
	    }
	},

	fadeOut = function(selection) {
	    selection.transition()
		.delay(15000)
		.remove()
		.each("end", function() {
		    maybeShowNoErrors();
		});
	},

	noErrors = bottomPanel.getContainer()
	    .classed("errors", true)
	    .append("div")
	    .classed("info", true)
	    .text("No errors.");
    
    return {
	informUser : function(text) {
	    console.log(text);

	    var infoMsg = bottomPanel.getContainer()
		    .append("div")
		    .classed("info", true)
		    .text(text);

	    hideNoErrors();

	    fadeOut(infoMsg);
	},
	warnUser : function(text) {
	    console.warn(text);

	    var errorMsg = bottomPanel.getContainer()
		    .append("div")
		    .classed("error", true);

	    errorMsg
		.append("div")
		.classed("error-text", true)
		.text(text);

	    errorMsg.append("div")
		.classed("close-error", true)
		.text("X")
		.on("click", function() {
		    errorMsg.remove();
		    maybeShowNoErrors();
		});

	    hideNoErrors();

	    bottomPanel.open();
	}
    };
};
