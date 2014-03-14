"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.colour = function() {

    var colourScale = function(data) {
	var numeric = [];
	var len = data.length;
	for (var i = 0; i < len; i++) {
	    var r = parseFloat(data[i]);
	    if (data[i] && isNaN(r)) {
		return d3.scale.category20();
	    } else {
		numeric.push(r);
	    }
	}
	    
	var min = Math.min(0, d3.min(numeric));
	
	return d3.scale.linear()
	    .domain([min, d3.max(numeric)])
	    .range(["blue", "red"]);
    };

    var categorical = d3.scale.category20();
    
    var module = {
	paintProperty : function(dataColumn, elements) {
	    var selection = d3.selectAll(elements);

	    var colour = colourScale(dataColumn);

	    selection.attr("fill", function(d, i){
		return colour(dataColumn[i]);
	    });
	},
	unpaint : function(elements) {
	    d3.selectAll(elements).attr("fill", null);
	}
    };
    return module;
};
