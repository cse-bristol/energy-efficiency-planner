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
	var updateResultsTable = function() {
	    l.resultsTable.info(
		l.worksheet.headers(),
		l.worksheet.data(),
		l.worksheet.getSortProperties()
	    );
	};

	var recolour = function() {
	    if (l.worksheet.getSortProperties().properties.length > 0) {
		var colour = l.worksheet.colour(),
		    col = l.worksheet.firstSortPropertyI();

		l.resultsTable.rows().each(function(d, i) {
		    d3.select(this)
			.selectAll("td")
			.each(function(d, i) {
			    var el = d3.select(this);
			    var background = i === col ? colour(d) : null,
				font = i === col ? colours.reverse(background) : null;

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

	if (!l.worksheet) {
	    throw new Error("Layer did not have a worksheet " + l.name());
	}

	if (!l.resultsTable) {
	    throw new Error("Layer did not have a results table " + l.name());
	}

	l.resultsTable.addToContainer(container);
	
	/*
	 When we click a header in the table, sort by that column.
	 */
	l.resultsTable.headerClicked(function(p) {
	    l.worksheet.sortProperty(p, d3.event.shiftKey);
	});

	l.resultsTable.rowClicked(function(d, i) {
	    /*
	     When we click on a row in the table, zoom to it on the map.

	     Highlight that row on the table, and hide all the others.
	     */
	    var id = d[0];
	    zoomTo(getShapeById(l, id).datum().bbox);

	    l.resultsTable.rows().
		classed("selected", function(d, i) {
		    return d[0] === id;
		});
	});
	
	l.resultsTable.rowHovered(function(d, i) {
	    /*
	     When we hover over a row in the table, highlight the corresponding shape in the map.
	     */
	    var id = d[0];
	
	    getShapes(l)
		.classed("highlight", function(d, i) {
		    return d.id === id;
		});
	});
	
	l.resultsTable.resetClicked(function() {
	    l.worksheet.sortProperty();
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

	l.worksheet.sortPropertyChanged(updateResultsTable);
	l.worksheet.sortPropertyChanged(recolour);
	l.worksheet.baseColourChanged(recolour);

	l.onSetOpacity(redraw);

	updateResultsTable();
	recolour();
    };
};
