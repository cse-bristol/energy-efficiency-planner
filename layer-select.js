"use strict";

/*global module, require*/

var float = require("floating-dialogue"),
    helpers = require("./helpers.js"),
    identity = helpers.identity,
    callbackHandler = helpers.callbackHandler;

/*
 Makes a clickable list of layers.
 */
module.exports = function(container, toolbar, layers) {
    var openclose = toolbar.append("span")
	    .html("L");
    
    var list = float(
	container.append("ul")
	    .attr("id", "layer-select"))
	    .open(openclose)
	    .content(),

	callbacks = callbackHandler();

    var redraw = function(){
	var li = list.selectAll("li")
		.data(layers.names());

	li.exit().remove();
	li.enter().append("li")
	    .html(identity)
	    .on("click", function(d, i){
		callbacks(d);
	    });
    };
    
    layers.layerCreated(redraw);
    layers.layerRemoved(redraw);
    
    return {
	onClick : function(callback) {
	    callbacks.add(callback);
	}
    };
};
