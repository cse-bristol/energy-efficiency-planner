"use strict";

/*global module, require*/

var d3 = require("d3");

/*
 Provides some functions which can be applied to an HTML element.
 */
module.exports = {
    drag: d3.behavior.drag()
	.origin(function(d){
	    var el = d3.select(this);
	    return {
		"x" : parseInt(el.style("left")),
		"y" : parseInt(el.style("top"))
	    };
	})
	.on("drag", function(d){
	    d3.select(this)
		.style("top", d3.event.y + "px")
		.style("left", d3.event.x + "px");
	}),

    close: function(container) {
	container.append("span")
	    .style("font-size", "large")
	    .style("position", "absolute")
	    .style("top", "5px")
	    .style("right", "5px")
	    .style("opacity", "0.6")
	    .html("❌")
	    .on("click", function(d, i){
		container.style("display", "none");
	    });
    },

    resize: function(container) {
	var dragHandle = d3.behavior.drag()
		.origin(function(d){
		    return {
			"x" : parseInt(container.style("width")),
			"y" : parseInt(container.style("height"))
		    };
		})
		.on("dragstart", function(d){
		    d3.event.sourceEvent.stopPropagation();
		})
		.on("drag", function(d){
		    container.style("height", d3.event.y + "px");
		    container.style("width", d3.event.x + "px");
		});

	container.append("span")
	    .style("font-size", "large")
	    .style("position", "absolute")
	    .style("bottom", "5px")
	    .style("right", "5px")
	    .style("opacity", "0.6")
	    .html("⇲")
	    .call(dragHandle);
    }
};