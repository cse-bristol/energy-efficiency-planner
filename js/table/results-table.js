"use strict";

/*global module, require*/

var d3 = require("d3"),
    helpers = require("./helpers.js"),
    dialogue = require("floating-dialogue"),
    callbackHandler = helpers.callbackHandler,
    identity = helpers.identity,
    rounded = helpers.rounded;

/*
 Make an info panel for a polygon on the map.
 
 Call it with a container which it will make the panel inside.
 */
module.exports = function(container) {
    var div = dialogue(
	container.append("div")
	    .classed("results", true))
	    .close()
	    .resize()
	    .drag()
	    .hide(),
	
	table = div.content().append("table")
	    .classed("results-table", true),
	tHead = table.append("thead"),
	headers = tHead.append("tr")
	    .classed("headers", true),
	tBody = table.append("tbody"),
	rowClickHandler = callbackHandler(),
	headClickHandler = callbackHandler(),
	rowHoverHandler = callbackHandler(),
	resetHandler = callbackHandler(),
	extraRow,
	gotSize = false;

    div.el().append("span")
	.classed("reset-results", true)
	.text("RESET")
	.on("click", resetHandler);

    var maybeNumber = function(n) {
	var num = parseFloat(n);
	if (isNaN(num) || !isFinite(n)) {
	    return n;
	} else {
	    return num;
	}
    };

    var sort = function(head, body, ordering) {
	var indices = ordering.properties.map(function(p){
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
    };

    var setColumnWidths = function(cellSelection) {
	tBody.select("tr")
	    .selectAll("td")
	    .each(function(d, i) {
		var width = d3.select(this).style("width");
		d3.select(cellSelection[0][i])
		    .style("min-width", width)
		    .style("max-width", width);
	    });
    };
    
    var module = {

	/* 
	 Update the info with the given data.
	 head should be a 1D array.
	 body should be a 2D array.
	 */
	info : function(head, data, ordering) {
	    sort(head, data, ordering);

	    var h = headers.selectAll("th").data(head);
	    h.exit().remove();
	    h.enter().append("th");
	    h.html(identity)
		.on("click", function(d, i) {
		    var column = data.map(function(row) {
			return row[i];
		    });
		    
		    headClickHandler(d, column);
		});
	    h.each(function(d, i){
		var j = ordering.properties.indexOf(d);
		this.sorted = (j >= 0);
		this.reverse = ordering.reverse[j];
	    })
		.classed("sorted", function(d, i){
		    return this.sorted;
		})
		.classed("reverse", function(d, i){
		    return this.reverse;
		});

	    var tr = tBody.selectAll("tr").data(
		data,
		function(d, i) {
		    return d[0];
		}
	    );
	    tr.enter().append("tr");
	    tr.exit().remove();
	    tr
		.on("click", rowClickHandler)
		.on("mouseenter", rowHoverHandler)
		.order();

	    var td = tr.selectAll("td").data(function(d, i){
		return d;
	    });

	    td.enter().append("td");
	    td.exit().remove();
	    td.html(rounded);

	    setColumnWidths(h);

	    if (!gotSize) {
		/*
		 Setting the size here allows us to autoresize the table's containing element to the content the first time,
		 but still provides scrollbars if it overflows the max-height.
		 */

		gotSize = true;
		div.el().style("height", div.el().node().offsetHeight + "px");
		div.el().style("width", div.el().node().offsetWidth + "px");
	    }
	},

	headerClicked : headClickHandler.add,
	rowClicked : rowClickHandler.add,
	rowHovered: rowHoverHandler.add,
	resetClicked: resetHandler.add,

	setExtraRow: function(row) {
	    if (extraRow) {
		extraRow.remove();
	    }

	    extraRow = d3.select(row.node().cloneNode(true));

	    setColumnWidths(
		extraRow
		    .classed("extra-row", true)
		    .selectAll("td"));
	    
	    tHead.node().appendChild(extraRow.node());
	},

	rows: function() {
	    return tBody.selectAll("tr");
	},

	cells: function() {
	    return tBody.selectAll("tr").selectAll("td");
	},

	dialogue: function() {
	    return div;
	},

	el: function() {
	    return div.el();
	},

	tbody: function() {
	    return tBody;
	}
    };

    return module;
};
