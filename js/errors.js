"use strict";

/*global module, require*/

var float = require("floating-dialogue"),
    d3 = require("d3");

module.exports = function(toolbar, body) {
    var dialogue = float(
	"errors",
	{
	    reposition: true,
	    resize: true,
	    close: true,
	    visible: false,
	    lockToScreen: true,
	    initialVisibility: false
	}
    ).single(),

	drawDialogueContent = function(dialogues, newDialogues) {
	    messages = dialogues;
	    
	    noErrors = newDialogues.append("div")
		.classed("info", true)
		.text("No errors.");
	},

	drawButtonContent = function(button, newButton) {
	    newButton.text("!");
	},	

	hideNoErrors = function() {
	    noErrors.style("display", "none");
	},

	maybeShowNoErrors = function() {
	    if (messages.node().childNodes.length <= 1) {
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

	drawing = dialogue.drawing(
	    body,
	    drawDialogueContent,
	    toolbar,
	    drawButtonContent
	),	

	messages,
	noErrors;

    drawing.update();

    return {
	save: dialogue.save,
	load: dialogue.load,
	reset: dialogue.reset,
	
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

	    dialogue.getState().setVisibility(true);
	    drawing.update();
	}
    };
};
