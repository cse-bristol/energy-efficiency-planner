"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}


// let's change this
// instead, we'll make a table
// the table will have some rows and columns


/*
 Make an info panel for a polygon on the map.
 
 Call it with a container which it will make the panel inside.
 */
OpenDataMap.areaInfo = function(container) {
    var table = container.append("table");
    var tHead = table.append("thead").append("tr");
    var tBody = table.append("tbody");
    
    var module = {

	/* 
	 Update the info with the given data.
	 Data should be a dictionary of dictionaries layer -> property -> value.
	 */
	info : function(head, body) {

	    if (body.length > 0) {
		
		var h = tHead.selectAll("th").data(head);
		h.exit().remove();
		h.enter().append("th");
		h.html(d3.identity);

		
		var tr = tBody.selectAll("tr").data(body);
		tr.enter().append("tr");
		tr.exit().remove();
		var td = tr.selectAll("td").data(function(d, i){
		    return d;
		});

		td.enter().append("td");
		td.exit().remove();
		td.html(d3.identity);
	    }
	}
	
    };

    module.info([], []);
    return module;
};
