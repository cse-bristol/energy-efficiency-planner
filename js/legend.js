"use strict";

/*global module, require*/

var float = require("floating-dialogue"),
    colourBarWidth = 40,
    colourBarHeight = 5;

/*
 A dialogue which displays useful information about enabled layers:
 + The name of the layer.
 + A legend for the layer if it has colouring enabled.

 This is the read-only counterpart to layer-control.js.
 */
module.exports = function(container, toolbar, getShapeLayers, getTileLayers) {

    var content = container.append("div")
	    .attr("id", "legend"),

	dialogue = float(content)
	    .close()
	    .drag()
	    .resize(),    
	
	redraw = function() {
	    var tileDivs = content.selectAll("div.tile-legend")
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
		   .each(function(tileLayer, i) {
		       if (tileLayer.legend && tileLayer.legend.onLoad) {
			   tileLayer.legend.onLoad(redraw);
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
		.attr("x", function(text, i) {
		    return i * (colourBarWidth + 1);
		})
		.attr("y", colourBarHeight + 10)
		.text(function(text, i) {
		    return text;
		});

	    // when we hover over a pixel, highlight the correct bit of the legend: tileDivs.enter().each()? Need a way to unhook this afterwards?
	    
	    // for shapes, we have a range, which we will turn into a map via the magic of binning.
	};

    toolbar.add("l", dialogue);
    
    return {
	update: function() {
	    redraw();
	}
    };
};
