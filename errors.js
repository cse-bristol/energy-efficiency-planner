"use strict";

/*global module, require*/

var float = require("floating-dialogue");

module.exports = function(container, toolbar) {

    var messagesOpenClose = toolbar.append("span")
	    .html("!");

    var messages = float(
	container.append("div")
	    .attr("id", "messages"))
	    .drag()
	    .resize()
	    .close()
	    .open(messagesOpenClose)
	    .hide()
	    .content();

    var fadeOut = function(selection) {
	selection.transition()
	    .delay(15000)
	    .style("opacity", "0.000001")
	    .remove();
    };
    
    return {
	informUser : function(text) {
	    console.log(text);
	    
	    var infoMsg = messages
		    .append("div")
		    .classed("info", true)
		    .html(text);

	    fadeOut(infoMsg);
	},
	warnUser : function(text) {
	    console.warn(text);
	    
	    var errorMsg = messages
		    .append("div")
		    .classed("error", true)
		    .html(text);

	    fadeOut(errorMsg);
	}
    };
};