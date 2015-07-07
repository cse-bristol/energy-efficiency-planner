"use strict";

/*global module, require*/

var d3 = require("d3"),
    helpers = require("../helpers.js"),
    colours = require("../colour.js"),
    isNum = helpers.isNum,
    rounded = helpers.rounded,
    asId = require("../id-maker.js").fromString,
    
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
module.exports = function(getTileLayers, getShapeLayers) {
    var makeLegends = function(dialogues, newDialogues, getLayerData) {
	newDialogues.classed("legend", true);

	newDialogues.append("div")
	    .classed(legendLabelClass, true);

	var labels = dialogues.select("." + legendLabelClass)
		.datum(getLayerData)
		.text(function(d, i) {
		    return d.legend.header();
		});
	
	newDialogues
	    .append("svg")
	    .classed(chartClass, true);

	var svg = dialogues.select("." + chartClass)
		.datum(getLayerData)
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
    };

    return {
	shapes: function(dialogues, newDialogues) {
	    makeLegends(
		dialogues,
		newDialogues,
		function(d, i) {
		    return d === undefined ? [] : getShapeLayers().get(d.id);
		}
	    );
	},
	tiles: function(dialogues, newDialogues) {
	    makeLegends(
		dialogues,
		newDialogues,
		function(d, i) {
		    return d === undefined ? [] : getTileLayers().overlays.get(d.id);
		}
	    );
	}
    };
};
