"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.errors = function(container) {
    return {
	warnUser : function(text) {
	    var errorMsg = container.append("div")
		    .classed("error", true)
		    .html(text);

	    errorMsg.transition()
		.delay(5000)
		.style("opacity", "0.000001")
		.remove();
	}
    };
};
