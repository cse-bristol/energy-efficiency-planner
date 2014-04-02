"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 Makes a clickable list of layers.
 */
OpenDataMap.layerSelect = function(container, layers) {
    var list = container.append("ul");
    var callbacks = [];

    var redraw = function(){
	var li = list.selectAll("li")
		.data(layers.names());

	li.exit().remove();
	li.enter().append("li")
	    .html(d3.identity)
	    .on("click", function(d, i){
		callbacks.forEach(function(c){
		    c(d);
		});
	    });
    };
    
    layers.layerCreated(redraw);
    layers.layerRemoved(redraw);

    return {
	onClick : function(callback) {
	    callbacks.push(callback);
	}
    };
};
