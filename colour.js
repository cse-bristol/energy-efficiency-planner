"use strict";

/*global d3, colorbrewer, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.colour = function() {
    var blank = "#D0D0D0";

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
	    
	return d3.scale.linear()
	    .domain([d3.min(numeric), d3.max(numeric)])
	    .range(["blue", "red"])
	    .interpolate(d3.interpolateLab);
    };

    var categorical = d3.scale.category20();

    var module = {
	paintSVGElements : function(dataColumn, elements) {
	    if (dataColumn.length === 0) {
		return;
	    }

	    var selection = d3.selectAll(elements);	    
	    var colour = colourScale(dataColumn);

	    selection.attr("fill", function(d, i) {
		var datum = dataColumn[i];
		return datum ? colour(dataColumn[i]) : blank;
	    });
	},
	paintHTMLSelection: function(dataColumn, selection) {
	    if (dataColumn.length === 0) {
		return;
	    }

	    var colour = colourScale(dataColumn);
	    selection.style("background-color", function(d, i){
		return d ? colour(d) : blank;
	    });
	},
	unpaint : function(elements) {
	    d3.selectAll(elements).attr("fill", null);
	},
	unpaintHTML: function(selection) {
	    selection.style("background-color", null);
	}
    };
    return module;
};
