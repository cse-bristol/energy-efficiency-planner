"use strict";

/*global module, require*/

var floatDialogue = require("floating-dialogue");

/*
 Lets us import shape layers from a variety of file formats.
 */
module.exports = function(toolbar, container, handlers) {
    var dialogue = floatDialogue(
	container.append("div")
    	    .attr("id", "import-dialogue")
    )
	    .drag(),

	filePicker = dialogue.content().append("input")
	    .attr("type", "file")
	    .attr("multiple", true)
	    .attr("accept", ".csv,.tsv,.json,.shp,.dbf,.prj")
	    .attr("id", "import-file-picker")
	    .on("change", function(d, i) {
		handlers(
		    Array.prototype.slice.call(this.files)
		);
	    });

    toolbar.add("I", dialogue);
    
    return {
	content: function() {
	    return dialogue.content();
	},

	show: function() {
	    return dialogue.show();
	}
    };
};
