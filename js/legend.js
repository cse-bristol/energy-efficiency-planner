"use strict";

/*global module, require*/

var d3 = require("d3"),
    dialogue = require("floating-dialogue"),
    helpers = require("./helpers.js"),
    asId = require("./id-maker.js").fromString,
    colourBarWidth = 40,
    colourBarHeight = 5,

    legendClass = "legend",
    legendLabelClass = "legend-label",
    chartClass = "legend-chart";

/*
 A dialogue which displays useful information about an enabled layer:
 + The name of the layer.
 + A legend for the layer.
 */
module.exports = function(container, getShapeLayers, getTileLayers) {
    var makeLegends = function(selection, newSelection) {
	    newSelection
		.append("svg")
		.classed(chartClass, true)
		.attr("height", colourBarHeight + 13);


	    var svg = selection.selectAll("." + chartClass)
		    .attr("width", function(layer, i) {
			if (layer.legend) {
			    return colourBarWidth * layer.legend().colours().length;
			}
			
			return null;
		    }),

		legendColours = svg
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
	    	.attr("width", colourBarWidth)
		.attr("height", colourBarHeight)
		.attr("fill", function(colour, i) {
		    return colour;
		});

	legendColours
	    .attr("x", function(d, i) {
		return i * (colourBarWidth + 1);
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
		.attr("text-anchor", "middle")
		.attr("y", colourBarHeight + 10)
		.text(function(text, i) {
		    if (typeof("text") === "string" && text.length > 9) {
			return text.slice(0, 7) + "..";
		    }

		    return text;
		});

	    legendText
	    	.attr("x", function(text, i) {
		    var layer = d3.select(this.parentNode).datum(),
			offset = layer.legend().isBoundary() ? 0 : 0.5;
		    
		    return (i + offset) * (colourBarWidth + 1);
		});
	},

	getColouringPropertyText = function(layer) {
	    if (layer.worksheet) {
		var props = layer.worksheet.getSortProperties().properties;
		if (props[0]) {
		    return " (" + props[0] + ")";
		}
	    }

	    return "";
	},

	makeLegendsForLayers = function(className, layers, hookNewDivs) {
	    var divs = container.selectAll("div." + className)
		    .data(
			layers,
			function(layer) {
			    return layer.name();
			}
		    );

	    divs.exit().remove();

	    var newDivs = divs.enter().append("div")
		    .classed(legendClass, true)
		    .classed(className, true)
		    .attr("id", function(layer, i) {
			return className + "-" + asId(layer.name());
		    })
		    .each(hookNewDivs)
		    .each(function(d, i) {
			var el = d3.select(this);
			d.legendDisplay = dialogue(el)
			    .drag()
			    .close()
			    .sticky()
			    .findSpace();
		    });

	    newDivs.append("div")
	    	.classed(legendLabelClass, true);

	    divs.select("." + legendLabelClass)
		.html(function(layer, i) {
		    return layer.name() +
			(
			    layer.legend && layer.legend.units ?
				" (" + layer.legend.units + ")" :
				""
			) +
			getColouringPropertyText(layer);
		});

	    divs
		.sort();

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

			tileLayer.colourChanged(function(pixelColour) {
			    var tileDiv = container.select("#tile-legend-" + name);

			    var colourString = pixelColour.toString();

			    if (!tileDiv.empty()) {
				tileDiv
				    .select("svg.legend-chart")
				    .selectAll("rect")
				    .classed("highlight", function(rectColour, i) {
					return rectColour === colourString;
				    });
			    }
			});
		    }		    
		}
	    );
	    
	    makeLegendsForLayers(
	    	"shape-legend",
	    	getShapeLayers().all(),
	    	function(shapeLayer, i) {
	    	    // Noop - shape layer legends currently have no interactions.
	    	}
	    );
	};

    redraw();
};
