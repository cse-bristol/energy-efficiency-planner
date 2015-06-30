"use strict";

/*global module, require*/

var d3 = require("d3"),
    colours = require("../colour.js"),

    getShapes = function(layer) {
	return d3.selectAll("g#" + layer.name() + " path");
    },

    getShapeById = function(layer, id) {
	return d3.select("g#" + layer.name() + " path#" + id);
    };

/*
 Takes a shape layer and gives it a results-table.

 Hooks up all the events between shapes on the map, the table, and the layer's worksheet.

 Call this when a shape layer is ready for display.
 */
module.exports = function(container, zoomTo, onClickShape, onHoverShape, redraw) {
    return function(l) {
	var recolour = function() {
	    if (l.worksheet.getSortProperties().properties.length > 0) {
		var column = l.worksheet.firstSortPropertyI(),
		    colourFun = l.worksheet.getColourFunction();

		l.resultsTable.rows().each(function(d, i) {
		    d3.select(this)
			.selectAll("td")
			.each(function(d, i) {
			    var el = d3.select(this);
			    var background = i === column ? colourFun(d) : null,
				font = i === column ? colours.reverse(background) : null;

			    el
				.style("background-color", background)
				.style("color", font);
			});
		});
	    } else {
		l.resultsTable.cells()
		    .style("background-color", null)
		    .style("color", null);
	    }

	    redraw();
	};

	l.resultsTable.rowClicked(function(d, i) {
	    /*
	     When we click on a row in the table, zoom to it on the map.

	     Highlight that row on the table, and clear highlights for the other rows.
	     */
	    var id = d[0];
	    zoomTo(getShapeById(l, id).datum().bbox);

	    l.resultsTable.rows().
		classed("selected", function(d, i) {
		    return d[0] === id;
		});
	});
	
	onClickShape(function(id, layer) {
	    /*
	     If we click on a shape, focus on it in the table.
	     */
	    var tbody = layer.resultsTable.tbody().node();

	    layer.resultsTable.rows().each(function(d, i) {
		var row = d3.select(this),
		    chosen = row.datum()[0] === id;

		if (chosen) {
		    tbody.scrollTop = this.offsetTop - 
			/*
			 Fudge factor found by experimentation, appears to work at different zoom levels.
			 I don't know why this difference is here. 
			 */
		    (2.7 * this.offsetHeight);
		}

		row.classed("selected", chosen);
	    });

	    layer.resultsTable.dialogue().show();
	});

	onHoverShape(function(id, layer) {
	    /*
	     Show the shape we're hovering the mouse cursor over as an extra layer in the table.
	     */
	    layer.resultsTable.setExtraRow(
		layer.resultsTable.rows().filter(function(d, i) {
		    return d3.select(this)
			.datum()[0] === id;
		})
	    );
	});
    };
};
