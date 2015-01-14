"use strict";

/*global module, require*/

var float = require("floating-dialogue"),
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
	    .resize(),    
	
	redraw = function() {
	    var tileDivs = dialogue.content().selectAll("div.tile-legend")
		    .data(
			getTileLayers().overlays
			    .values()
			    .filter(
				function(tileLayer) {
				    return tileLayer.options.opacity > 0;
				}
			    ),
			function(tileLayer) {
			    return tileLayer.name();
			}
		    );

	    tileDivs.exit().remove();
	    
	    var newTileDivs =  tileDivs.enter().append("div")
		    .classed("tile-legend", true)
		    .attr("id", function(tileLayer, i) {
			return "tile-legend-" +
			    asId(
				tileLayer.name());
		    })
		    .each(function(tileLayer, i) {
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
		    });

	    newTileDivs
		.append("div")
		.classed("legend-label", true)
		.html(function(tileLayer, i) {
		    return tileLayer.name() + (
			tileLayer.legend ?
			    " (" + tileLayer.legend.units + ")" :
			    ""
		    );
		});
	    
	    newTileDivs
		.append("svg")
		.classed("legend-chart", true)
		.attr("height", colourBarHeight + 13);


	    var tileSVG = tileDivs.selectAll("svg.legend-chart")
		    .attr("width", function(tileLayer) {
			if (tileLayer.legend) {
			    return colourBarWidth * tileLayer.legend().colours().length;
			}
			
			return null;
		    });


	    var tileLegendColours = tileSVG
		    .selectAll("rect")
		    .data(
			function(tileLayer, i) {
			    return tileLayer.legend ?
				tileLayer.legend().colours() :
				[];
			},
			function(colour) {
			    return colour;
			}
		    );

	    tileLegendColours.exit().remove();
	    tileLegendColours.enter().append("rect")
	    	.attr("x", function(d, i) {
		    return i * (colourBarWidth + 1);
		})
	    	.attr("width", colourBarWidth)
		.attr("height", colourBarHeight)
		.attr("fill", function(colour, i) {
		    return colour;
		});

	    var tileLegendText = tileSVG
		    .selectAll("text")
		    .data(
			function(tileLayer, i) {
			    return tileLayer.legend ?
				tileLayer.legend().numbers() :
				[];
			},
			function(number) {
			    return number;
			}
		    );

	    tileLegendText.exit().remove();
	    tileLegendText.enter().append("text")
		.attr("width", colourBarWidth)
		.attr("height", colourBarHeight)
		.attr("text-anchor", "middle")
		.attr("y", colourBarHeight + 10)
		.text(function(text, i) {
		    return text;
		});

	    tileLegendText
	    	.attr("x", function(text, i) {
		    return i * (colourBarWidth + 1);
		});
	};

    toolbar.add("l", dialogue);
    
    return {
	update: function() {
	    redraw();
	}
    };
};
