"use strict";

/*global d3, colorbrewer, OpenDataMap*/

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
	
	return d3.scale.quantize()
	    .domain([min, d3.max(numeric)])
	    .range(colorbrewer.Oranges[9]);
    };

    var categorical = d3.scale.category20();
    
    var module = {
	paintProperty : function(dataColumn, elements) {
	    if (dataColumn.length === 0) {
		return;
	    }
	    
	    var selection = d3.selectAll(elements);

	    var colour = colourScale(dataColumn);

	    selection.attr("fill", function(d, i){
		var datum = dataColumn[i];
		return datum ? colour(dataColumn[i]) : "#D0D0D0";
	    });
	},
	unpaint : function(elements) {
	    d3.selectAll(elements).attr("fill", null);
	}
    };
    return module;
};
