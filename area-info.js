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
    var module = {

	/* 
	 Update the info with the given data.
	 Data should be a list of lists of dictionary entries.
	 [[{'key' : keyName, 'value' : value}]]
	 */
	info : function(data) {
	    
	    var ul = container.selectAll("ul")
		    .data(data);

	    ul.enter().append("ul");
	    ul.exit().remove();
	    
	    var li = ul.selectAll("li")
    		    .data(d3.identity);

	    li.enter().append("li");
	    li.exit().remove();
	    li.html(function(property) {
    		return property.key + ": " + property.value;
	    });	    
	}
	
    };

    module.info([]);
    return module;
};
