"use strict";

/*global module, require*/

var toolText = "I";

/*
 Lets us import shape layers from a variety of file formats.
 */
module.exports = function(toolbar, container, handlers) {
    var content,

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
