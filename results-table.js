"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}


/*
 Make an info panel for a polygon on the map.
 
 Call it with a container which it will make the panel inside.
 */
OpenDataMap.resultsTable = function(container) {
    var table = container.append("table");
    var tHead = table.append("thead").append("tr");
    var tBody = table.append("tbody");
    var clickHandlers = [];

    var transpose = function(arr){
	if (arr.length === 0) {
	    return [];
	}
	
	return arr[0].map(function(col, i) { 
	    return arr.map(function(row) { 
		return row[i];
	    });
	});
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
		if (a[j] > b[j]) {
		    return 1 * direction;
		} else if (a[j] < b[j]) {
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
	info : function(head, body, ordering) {
	    var data = transpose(body);
	    sort(head, data, ordering);

	    var h = tHead.selectAll("th").data(head);
	    h.exit().remove();
	    h.enter().append("th");
	    h.html(d3.identity)
		.on("click", function(event, index) {
		    var column = body.map(function(row){
			return row[index];
		    });
		    
		    clickHandlers.forEach(function(h){
			h(event, column);
		    });
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
	    var td = tr.selectAll("td").data(function(d, i){
		return d;
	    });

	    td.enter().append("td");
	    td.exit().remove();
	    td.html(withRounding);
	},

	headerClicked : function(clickHandler) {
	    clickHandlers.push(clickHandler);
	}
    };

    module.info([], [], {properties: [], reverse: []});
    return module;
};
