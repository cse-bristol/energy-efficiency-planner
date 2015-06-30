"use strict";

/*global module, require*/

var d3 = require("d3"),
    dialogue = require("floating-dialogue"),
    helpers = require("../helpers.js"),
    callbacks = helpers.callbackHandler,
    rounded = function(d, i) {
	return helpers.rounded(d, 5);
    };

/*
 Make an table describing a shape layer on the map.

 ToDo: colours
 ToDo: shape hover (extra-row)
 ToDo: shape clicks (focus) - this should come from the worksheet
 ToDo: column widths 
 ToDo: table size
 */
module.exports = function(getShapeLayers, updateShapeLayer) {
    var maybeNumber = function(n) {
	var num = parseFloat(n);
	if (isNaN(num) || !isFinite(n)) {
	    return n;
	} else {
	    return num;
	}
    },

	sort = function(head, body, ordering) {
	    var indices = ordering.properties.map(function(p) {
		return head.indexOf(p);
	    });

	    var len = indices.length;
	    body.sort(function(a, b){
		for (var i = 0; i < len; i++) {
		    var direction = ordering.reverse[i] ? -1 : 1;
		    var j = indices[i];
		    var first = maybeNumber(a[j]);
		    var second = maybeNumber(b[j]);
		    
		    if (first > second) {
			return 1 * direction;
		    } else if (first < second) {
			return -1 * direction;
		    } else {
			// No-op, we'll carry on looping.
		    }
		}
		return 0;
	    });
	},

	drawHeaders = function(tables, newTables) {
	    var newTHead = newTables.append("thead"),
		newHeaderRows = newTHead.append("tr")
		    .classed("headers", true),

		th = tables
		    .select("thead")
		    .select("tr")
		    .selectAll("th")
		    .data(
			function(d, i) {
			    return d.worksheet
				.columns()
				.map(function(column) {
				    return {
					layerId: d.name,
					column: column.name,
					sort: column.sort
				    };
				});
			},
			function(d, i) {
			    return d.column;
			}
		    );

	    th.exit().remove();

	    var newTh = th.enter()
		    .append("th")
	    	    .on("click", function(d, i) {
			getShapeLayers()
			    .get(d.layerId)
			    .worksheet
			    .sortProperty(d.column, d3.event.shiftKey);
			
			updateShapeLayer(d.layerId);
		    });

	    th
		.text(function(d, i) {
		    return d.column;
		})
		.classed("sorted", function(d, i) {
		    return !!d.sort;
		})
		.classed("reverse", function(d, i) {
		    return d.sort === "reverse";
		});
	},

	drawBody = function(tables, newTables) {
	    var newTBody = newTables.append("tbody")
    		    .on("scroll", function(d, i) {
			/*
			 Scroll the header with the body.
			 I would prefer to set scrollLeft on the header, but this only works if it has its own scrollbar.
			 Instead we have this negative-margin hack.
			 */
			d3.select(this.parentElement)
			    .select("thead")
			    .style("margin-left", (-this.scrollLeft) + "px");
		    }),

		tBody = tables.select("tbody"),

		tr = tBody.selectAll("tr")
		    .data(
			function(d, i) {
			    return d.worksheet.rows()
				.map(function(row) {
				    return {
					layerId: d.name,
					shapeId: row.id,
					selected: row.selected,
					cells: row.cells
				    };
				});
			},
			function(d, i) {
			    return d.shapeId;
			}
		    );

	    tr.exit().remove();

	    tr.enter()
		.append("tr")
		.on("click", function(d, i) {
		    var worksheet = getShapeLayers()
			    .get(d.layerId)
			    .worksheet;

		    worksheet.selectShape(d.shapeId);
		    
		    updateShapeLayer();
		    panAndZoom(d.layerId, worksheet.getSelectedShapeId());
		})
		.on("mouseenter", function(d, i) {
		    // ToDo highlight the shape
		});

	    tr
		.classed("selected-row", function(d, i) {
		    return d.selected;
		})
		.order();

	    
	    var td = tr.selectAll("td")
		    .data(
			function(d, i) {
			    return d.cells;
			},
			function(d, i) {
			    return i;
			}
		    );

	    td.exit().remove();

	    td.enter().append("td");

	    td.text(function(d, i) {
		return d;
	    });
	};
    

    return function(dialogues, newDialogues) {
	var newTables = newDialogues.append("table")
		.classed("results-table", true),

	    tables = dialogues.select("table");

	drawHeaders(tables, newTables);

	drawBody(tables, newTables);


	var newReset = newDialogues
		.append("span")
		.classed("reset-results", true)
		.text("RESET")
		.on("click", function(d, i) {
		    getShapeLayers()
			.get(d.id)
			.worksheet
			.sortProperty();
		});
    };
};



