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
	        .attr("id", "import-dialogue")
		.append("form")
		.append("input")
		.attr("type", "file")
		.attr("multiple", true)
		.attr("accept", ".csv,.tsv,.json,.shp,.dbf,.prj")
		.attr("id", "import-file-picker")
		.on("change", function(d, i) {
		    handlers(
			Array.prototype.slice.call(this.files)
		    );
		    /*
		     Clear the files so that this will work if the user selects the same files twice in a row.
		     */
		    this.parentElement.reset();
		});
	};

    toolbar.add(toolText, dialogueFactory, drawContent);
    
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
