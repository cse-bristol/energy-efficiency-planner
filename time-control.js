"use strict";

/*global module, require*/

var d3 = require("d3"),
    float = require("floating-dialogue");

/*
 Given a container, provides a time slider which lets the user set the current year.
*/
module.exports = function(container, toolbar, min, max, start) {
    var timeOpenClose = toolbar.append("span")
	    .html("⌛");

    var timeContainer = float(container.append("div")
	    .attr("id", "time"))
	    .open(timeOpenClose)
	    .hide()
	    .content();

    var display = timeContainer.append("h2")
	    .html(start);
    
    var slider = timeContainer
	    .append("div")
	    .classed("time-input-wrapper", true)
	    .append("input")
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
