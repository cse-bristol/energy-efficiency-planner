"use strict";

/*global d3, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 Given a container, provides a time slider which lets the user set the current year.
*/
OpenDataMap.timeControl = function(container, min, max, start) {
    var display = container.append("p")
	    .html(start);
    
    var slider = container.append("input")
	    .attr("type", "range")
	    .attr("min", min)
	    .attr("max", max)
	    .attr("step", 1)
	    .attr("value", start);

    var current = start;

    var callbacks = [];

    slider.on("change", function(event, index){
	current = d3.event.target.value;
	display.html(current);
	callbacks.forEach(function(c){
	    c(current);
	});
    });

    var module = {
	/*
	 Passed a function, calls that function with the new date whenever it changes.
	 */
	onChange : function(callback) {
	    callbacks.push(callback);
	},

	current : function() {
	    return current;
	}
    };

    return module;
};
