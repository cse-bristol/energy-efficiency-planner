"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.colour = function() {
    var numeric = function(datum) {
	return !datum || !isNaN(parseFloat(datum));
    };

    var colourScale = function(data) {
	if (data.every(numeric)) {
	    return d3.scale.linear()
		    .domain([d3.min(data), d3.max(data)])
		    .range(["blue", "red"]);
	} else {
	    return d3.scale.category20();
	}
    };

    var categorical = d3.scale.category20();
    
    var module = {
	paintProperty : function(dataColumn, selection) {

	    var colour = colourScale(dataColumn);

	    selection.attr("fill", function(d, i){
		return colour(dataColumn[i]);
	    });
	},
	unpaint : function(selection) {
	    selection.attr("fill", null);
	}
    };
    return module;
};
