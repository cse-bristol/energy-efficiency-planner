"use strict";

/*global module, require*/

var helpers = require("./helpers.js"),
    dialogue = require("floating-dialogue"),
    callbackHandler = helpers.callbackHandler,
    identity = helpers.identity;

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
	    .classed(".results-table", true),
	tHead = table.append("thead").append("tr"),
	tBody = table.append("tbody"),
	rowHandlers = callbackHandler(),
	headHandlers = callbackHandler(),
	resetHandlers = callbackHandler();

    div.el().append("span")
	.classed("reset-results", true)
	.text("RESET")
	.on("click", resetHandlers);

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

    var withRounding = function(maybeNumber) {
	var n = parseFloat(maybeNumber);
	if (isNaN(n) || !isFinite(maybeNumber)) {
	    return maybeNumber;
	} else {
	    return +n.toFixed(2);
	}
    };
    
    var module = {

	/* 
	 Update the info with the given data.
	 head should be a 1D array.
	 body should be a 2D array.
	 */
	info : function(head, data, ordering) {
	    sort(head, data, ordering);

	    var h = tHead.selectAll("th").data(head);
	    h.exit().remove();
	    h.enter().append("th");
	    h.html(identity)
		.on("click", function(event, index) {
		    var column = data.map(function(row) {
			return row[index];
		    });
		    
		    headHandlers(event, column);
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

	    var tr = tBody.selectAll("tr").data(data);
	    tr.enter().append("tr");
	    tr.exit().remove();
	    tr.on("click", function(event, index){
		rowHandlers(head, event);
	    });

	    var td = tr.selectAll("td").data(function(d, i){
		return d;
	    });

	    td.enter().append("td");
	    td.exit().remove();
	    td.html(withRounding);
	},

	headerClicked : headHandlers.add,
	rowClicked : rowHandlers.add,
	resetClicked: resetHandlers.add,

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
	}
    };

    module.info([], [], {properties: [], reverse: []});
    return module;
};
