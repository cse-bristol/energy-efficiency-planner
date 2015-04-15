"use strict";

/*global module, require*/

var d3 = require("d3"),
    dialogue = require("floating-dialogue"),
    helpers = require("./helpers.js"),
    colours = require("./colour.js"),
    isNum = helpers.isNum,
    rounded = helpers.rounded,
    asId = require("./id-maker.js").fromString,
    
    groupHeight = 10,
    textWidth = 80,
    textPadding = 2,

    legendClass = "legend",
    legendGroupClass = "legend-group",
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
	    .classed(chartClass, true);

	var svg = selection.select("." + chartClass)
		.attr("width", function(layer, i) {
		    if (layer.legend) {
			return textPadding + (textWidth * layer.legend().width);
		    } else {
			return null;
		    }
		})
		.attr("height", function(layer) {
		    if (layer.legend) {
			return layer.legend().labelsByColour.size() * groupHeight;
		    }
		    
		    return null;
		}),

	    legendColours = svg
		.selectAll("g." + legendGroupClass)
		.data(
		    function(layer, i) {
			if (layer.legend) {
			    var legend = layer.legend();

			    return legend.labelsByColour.entries()
				.map(function(e) {
				    return {
					colour: e.key,
					labels: e.value,
					legend: legend
				    };
				});
			} else {
			    return [];
			}
		    },
		    function(d, i) {
			return d.colour;
		    }
		);

	legendColours.exit().remove();
	var newLegendColours = legendColours.enter()
		.append("g")
		.classed(legendGroupClass, true)
		.attr("fill", function(d, i) {
		    return colours.reverse(d.colour);
		});
	
	legendColours
	    .sort(function(a, b) {
		if (a.labels[0] === undefined || b.labels[0] === undefined) {
		    return a.colour.localeCompare(b.colour);
		} else {
		    if (a.legend.numeric) {
			return a.labels[0] - b.labels[0];
		    } else {
			
			return a.labels[0].localeCompare(b.labels[0]);
		    }
		}
	    })
	    .attr("transform", function(d, i) {
		return "translate(0," + (i * groupHeight) + ")";
	    });

	newLegendColours.append("rect")
	    .attr("width", "100%")
	    .attr("height", groupHeight)
	    .attr("fill", function(d, i) {
		return d.colour;
	    });

	var legendText = legendColours
		.selectAll("text")
		.data(
		    function(d, i) {
			return d.labels;
		    },
		    function(datum) {
			return datum;
		    }
		);

	legendText.exit().remove();

	legendText.enter().append("text")
	    .attr("text-anchor", function(text, i) {
		var legend = d3.select(this.parentNode).datum().legend;
		
		return legend.numeric ? "end" : "start"; 
	    })
	    .attr("y", 9)
	    .attr("x", function(d, i) {
		var legend = d3.select(this.parentNode).datum().legend,
		    offset = legend.numeric ? 1 : 0;
		
		return textPadding + (textWidth * (i + offset));
	    })
	    .text(function(text, i) {
		if (isNum(text)) {
		    return rounded(text);
		} else if (text.length > 15) {
		    return text.slice(0, 13) + "..";
		} else {
		    return text;
		}
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
