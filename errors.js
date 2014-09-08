"use strict";

/*global module*/

module.exports = function(container) {
    var fadeOut = function(selection) {
	selection.transition()
	    .delay(5000)
	    .style("opacity", "0.000001")
	    .remove();
    };
    
    return {
	informUser : function(text) {
	    console.log(text);
	    
	    var infoMsg = container.append("div")
		    .classed("info", true)
		    .html(text);

	    fadeOut(infoMsg);
	},
	warnUser : function(text) {
	    console.warn(text);
	    
	    var errorMsg = container.append("div")
		    .classed("error", true)
		    .html(text);

	    fadeOut(errorMsg);
	}
    };
};