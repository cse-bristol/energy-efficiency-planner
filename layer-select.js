"use strict";

/*global module, require*/

var helpers = require("./helpers.js"),
    identity = helpers.identity,
    callbackHandler = helpers.callbackHandler;

/*
 Makes a clickable list of layers.
 */
module.exports = function(container, layers) {
    var list = container.append("ul");
    var callbacks = callbackHandler();

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
