"use strict";

/*global module, require*/

var floatDialogue = require("floating-dialogue"),
    toolText = "I";

/*
 Lets us import shape layers from a variety of file formats.
 */
module.exports = function(toolbar, container, handlers) {
    var dialogueFactory = floatDialogue(
	container,
	toolbar.get,
	toolbar.update,
	"imports",
	{
	    reposition: true,
	    lockToScreen: true
	}
    ),

	content,

	drawContent = function(dialogues, newDialogues) {
	    content = newDialogues;

	    newDialogues
	        .attr("id", "import-dialogue");

	};

    return {
	content: function() {
	    return content;
	},

	show: function() {
	    toolbar.get(toolText).setVisibility(true);
	    toolbar.update();
	}
    };
};
