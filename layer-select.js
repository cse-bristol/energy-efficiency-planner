"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 Makes a clickable list of layers.
 */
OpenDataMap.layerSelect = function(container, map, layerNames) {
    var list = container.append("ul");
    var callbacks = [];

    var li = list.selectAll("li")
	    .data(layerNames)
	    .enter().append("li")
	    .html(d3.identity)
	    .on("click", function(d, i){
		callbacks.forEach(function(c){
		    c(d);
		});
	    });
    return {
	/* 
	 callback 
	 */
	onClick : function(callback) {
	    callbacks.push(callback);
	}
    };
};
