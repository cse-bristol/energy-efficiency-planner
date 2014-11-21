"use strict";

/*global module, require*/

var float = require("floating-dialogue"),
    d3 = require("d3");

module.exports = function(container, toolbar) {
    var messagesOpenClose = toolbar.append("span")
	    .html("!"),

	dialogue = float(
	    container.append("div")
		.attr("id", "messages"))
	    .drag()
	    .resize()
	    .close()
	    .open(messagesOpenClose)
	    .hide(),

	messages = dialogue
	    .content(),

	noErrors = messages.append("div")
	    .classed("info", true)
	    .text("No errors.");

    var hideNoErrors = function() {
	noErrors.style("display", "none");
    };

    var maybeShowNoErrors = function() {
	if (messages.node().childNodes.length <= 1) {
	    noErrors.style("display", "block");
	}
    };

    var fadeOut = function(selection) {
	selection.transition()
	    .delay(15000)
	    .remove()
	    .each("end", function() {
		maybeShowNoErrors();
	    });
    };
    
    return {
	informUser : function(text) {
	    console.log(text);
	    
	    var infoMsg = messages
		    .append("div")
		    .classed("info", true)
		    .text(text);

	    hideNoErrors();

	    fadeOut(infoMsg);
	},
	warnUser : function(text) {
	    console.warn(text);
	    
	    var errorMsg = messages
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

	    dialogue.show();
	}
    };
};