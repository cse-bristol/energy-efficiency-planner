"use strict";

/*global module, require*/

var d3 = require("d3");

module.exports = function(container, drawErrors, drawLayerControl, drawImport) {
    var el = container.append("div")
	    .attr("id", "toolbar");

    return {
	draw: function(errorDialogueState, layerDialogueState, importDialogueState) {


	    buttons.exit().remove();

	    buttons.enter()
		.append("span")
		.text(function(d, i) {
		    return d.toolText;
		});

	    // These need to interact with dialogue.drawButtons?
	    
	}
    };
};
