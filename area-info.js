"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}


/*
 Make an info panel for a polygon on the map.
 
 Call it with a container which it will make the panel inside.
 */
OpenDataMap.areaInfo = function(container) {
    var table = container.append("table");
    var tHead = table.append("thead").append("tr");
    var tBody = table.append("tbody");
    var clickHandlers = [];

    var transpose = function(arr){
	return arr[0].map(function(col, i) { 
	    return arr.map(function(row) { 
		return row[i];
	    });
	});
    };
 
    var module = {

	/* 
	 Update the info with the given data.
	 head should be a 1D array.
	 body should be a 2D array.
	 */
	info : function(head, body) {

	    if (body.length > 0) {
		
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

		var tr = tBody.selectAll("tr").data(transpose(body));
		tr.enter().append("tr");
		tr.exit().remove();
		var td = tr.selectAll("td").data(function(d, i){
		    return d;
		});

		td.enter().append("td");
		td.exit().remove();
		td.html(d3.identity);
	    }
	},

	addClickHandler : function(clickHandler) {
	    clickHandlers.push(clickHandler);
	}
    };

    module.info([], []);
    return module;
};
