"use strict";

/*global module, require*/

var d3 = require("d3"),
    helpers = require("../helpers.js"),
    callbacks = helpers.callbackHandler,
    rounded = function(d, i) {
	return helpers.rounded(d, 5);
    },

    widthPerChar = 1.1;

/*
 Make an table describing a shape layer on the map.
 */
module.exports = function(getShapeLayers, update) {
    var rowClicked = callbacks(),
	rowHovered = callbacks(),

	maybeNumber = function(n) {
	    var num = parseFloat(n);
	    if (isNaN(num) || !isFinite(n)) {
		return n;
	    } else {
		return num;
	    }
	},

	rowId = function(layerId, shapeId) {
	    return "results-row-" + layerId + "-" + shapeId;
	},

	width = function(d, i) {
	    return (d.width * widthPerChar) + "ch";
	},

	cellWidth = function(selection) {
	    return selection
		.style("min-width", width)
		.style("max-width", width);
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
				.headersWithSort()
				.map(function(column) {
				    return {
					layerId: d.name(),
					column: column.name,
					sort: column.sort,
					width: column.width
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
	    	    .call(cellWidth)
	    	    .on("click", function(d, i) {
			getShapeLayers()
			    .get(d.layerId)
			    .worksheet
			    .sortProperty(d.column, d3.event.shiftKey);
			
			update();
		    });

	    th
		.text(function(d, i) {
		    return d.column;
		})
		.classed("sorted", function(d, i) {
		    return !!d.sort;
		})
		.classed("reverse", function(d, i) {
		    return d.sort === "ascending";
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
			    return d.worksheet.getRowData()
				.map(function(row) {
				    return {
					layerId: d.name(),
					shapeId: row.id,
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
		.attr("id", function(d, i) {
		    return rowId(d.layerId, d.shapeId);
		})
		.on("click", function(d, i) {
		    rowClicked(d.layerId, d.shapeId);
		})
		.on("mouseenter", function(d, i) {
		    rowHovered(d.layerId, d.shapeId);
		});

	    tr
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

	    td.enter().append("td")
		.call(cellWidth);

	    td.text(function(d, i) {
		return rounded(d.value);
	    })
		.style("background-color", function(d, i) {
		    return d.colour;
		})
		.style("color", function(d, i) {
		    return d.textColour;
		});
	};
    
    return {
	drawDialogues: function(dialogues, newDialogues) {
	    /*
	     Vertical table scrolling won't work unless we manually set a height style on the element.
	     */
	    dialogues
		.filter(function(d, i) {
		    return !d.manuallySized();
		})
		.style("height", function(d, i) {
		    return "height",
		    (
			4 + 
			    (
				getShapeLayers().get(d.id)
				    .worksheet
				    .getRowCount()
				    * 1.6
			    )
			
		    ) + "em";
		});
	    
	    var newTables = newDialogues.append("table")
		    .classed("results-table", true),
		
		tables = dialogues.select(".results-table");

	    tables.datum(function(d, i) {
		return getShapeLayers().get(d.id);
	    });

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

			update();
		    });
	},

	addEmphasis: function(rowSelection) {
	    rowSelection.classed("highlight", true);
	},

	clearEmphasis: function(rowSelection) {
	    rowSelection.classed("highlight", false);
	},

	rowId: rowId,

	rowClicked: rowClicked.add,
	rowHovered: rowHovered.add
    };
};



