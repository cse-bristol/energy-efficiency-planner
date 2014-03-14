"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.calculationsDisplay = function(container) {
    var ul = container.append("ul");
    
    return {
	update : function(sources) {
	    var li = ul.selectAll("li").data(sources);
	    li.exit().remove();
	    li.enter().append("li");
	    li.html(function(s){
		return s.name();
	    });
	}
    };
};
