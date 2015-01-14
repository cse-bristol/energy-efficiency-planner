"use strict";

/*global module, require*/

var d3 = require("d3"),
    float = require("floating-dialogue"),
    helpers = require("./helpers.js"),
    asId = require("./id-maker.js").fromString,
    colourBarWidth = 40,
    colourBarHeight = 5;

/*
 A dialogue which displays useful information about enabled layers:
 + The name of the layer.
 + A legend for the layer if it has colouring enabled.

 This is the read-only counterpart to layer-control.js.
 */
module.exports = function(container, toolbar, getShapeLayers, getTileLayers) {

    var dialogue = float(
	container.append("div")
	    .attr("id", "legend"))
	    .close()
	    .drag()
	    .resize()
	    .hide()
	    .bringToFront(),

	makeLegends = function(selection, newSelection) {
	    newSelection
		.append("svg")
		.classed("legend-chart", true)
		.attr("height", colourBarHeight + 13);


	    var svg = selection.selectAll("svg.legend-chart")
		    .attr("width", function(layer, i) {
			if (layer.legend) {
			    return colourBarWidth * layer.legend().colours().length;
			}
			
			return null;
		    });


	    var legendColours = svg
		    .selectAll("rect")
		    .data(
			function(layer, i) {
			    return layer.legend ?
				layer.legend().colours() :
				[];
			},
			function(colour) {
			    return colour;
			}
		    );

	    legendColours.exit().remove();
	    legendColours.enter().append("rect")
	    	.attr("x", function(d, i) {
		    return i * (colourBarWidth + 1);
		})
	    	.attr("width", colourBarWidth)
		.attr("height", colourBarHeight)
		.attr("fill", function(colour, i) {
		    return colour;
		});

	    var legendText = svg
		    .selectAll("text")
		    .data(
			function(layer, i) {
			    return layer.legend ?
				layer.legend().labels() :
				[];
			},
			function(number) {
			    return number;
			}
		    );

	    legendText.exit().remove();
	    legendText.enter().append("text")
		.attr("width", colourBarWidth)
		.attr("height", colourBarHeight)
		.attr("text-anchor", "middle")
		.attr("y", colourBarHeight + 10)
		.text(function(text, i) {
		    return text;
		});

	    legendText
	    	.attr("x", function(text, i) {
		    var layer = d3.select(this.parentNode).datum(),
			offset = layer.legend().isBoundary() ? 0 : 0.5;
		    
		    return (i + offset) * (colourBarWidth + 1);
		});
	},

	makeLegendsForLayers = function(className, layers, hookNewDivs) {
	    var divs = dialogue.content().selectAll("div." + className)
		    .data(
			layers.filter(
			    function(layer) {
				return layer.options.opacity > 0;
			    }
			),
			function(layer) {
			    return layer.name();
			}
		    );

	    divs.exit().remove();

	    var newDivs = divs.enter().append("div")
		    .classed(className, true)
		    .attr("id", function(layer, i) {
			return className + "-" + asId(layer.name());
		    })
		    .each(hookNewDivs);

	    newDivs.append("div")
		.classed("legend-label", true)
		.html(function(layer, i) {
		    return layer.name() + (
			layer.legend && layer.legend.units ?
			    " (" + layer.legend.units + ")" :
			    ""
		    );
		});

	    makeLegends(divs, newDivs);	    
	},
	
	redraw = function() {
	    makeLegendsForLayers(
		"tile-legend",
		getTileLayers().overlays.values(),
		function(tileLayer, i) {
		    if (tileLayer.legend && tileLayer.legend.onLoad) {
			tileLayer.legend.onLoad(redraw);
			var name = asId(tileLayer.name());

			tileLayer.colourChanged(function(colour) {
			    var colourIndex = tileLayer.legend().colourIndex(colour),
				tileDiv = dialogue.content().selectAll("#tile-legend-" + name);

			    if (!tileDiv.empty()) {

				tileDiv
				    .select("svg.legend-chart")
				    .selectAll("rect")
				    .attr("stroke", function(colour, i) {
					return i === colourIndex ?
					    "black" :
					    "none";
				    });
			    }
			});
		    }		    
		}
	    );
	    
	    makeLegendsForLayers(
	    	"shape-legend",
	    	getShapeLayers().sortedByZ(),
	    	function(shapeLayer, i) {
	    	    // TODO set up all my hover and click behaviours
	    	}
	    );
	};

    toolbar.add("l", dialogue);
    
    return {
	update: function() {
	    redraw();
	}
    };
};
