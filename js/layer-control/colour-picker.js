"use strict";

/*global module, require*/

var d3 = require("d3"),
    featureDetection = require("../browser-feature-detection.js");

module.exports = function(getShapeLayerById, update) {
    var supported = featureDetection.input.colour,
	choices = supported ? null : d3.scale.category10().range();

    
    return function(shapes, newShapes) {
	if (supported) {
	    newShapes.append("input")
		.attr("type", "color")
		.classed("colour-picker", true)
		.on("mousedown", function(d, i) {
		    d3.event.stopPropagation();
		})
		.on("click", function(d, i) {
		    d3.event.stopPropagation();
		})
		.on("input", function(d, i) {
		    getShapeLayerById(d)
			.worksheet
			.setBaseColour(
			    this.value
			);
		    update();
		});

	    shapes.select(".colour-picker")
		.each(function(d, i) {
		    this.value = getShapeLayerById(d)
			.worksheet
			.baseColour();
		});
	    
	} else {
	    newShapes.append("div")
		.classed("colour-picker", true);

	    var clickableColours = shapes.selectAll("span")
		    .data(function(d, i) {
			var currentColour = getShapeLayerById(d)
				.worksheet
				.baseColour();
			
			return choices.map(function(choice) {
			    return {
				colour: choice,
				selected: choice === currentColour,
				layer: d				
			    };
			});
		    });

	    clickableColours.exit().remove();

	    clickableColours.enter()
		.append("span")
		.on("mousedown", function(d, i) {
		    d3.event.stopPropagation();
		})
		.on("click", function(d, i) {
		    d3.event.stopPropagation();
		    
		    getShapeLayerById(d.layer)
			.worksheet
			.setBaseColour(d.colour);

		    update();
		});
		
	    clickableColours.classed("selected", function(d, i) {
		return d.selected;
	    });
	}
    };
};
