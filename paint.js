"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.paint = function(container, projection, dataSource) {
    var path = d3.geo.path()
	.projection(projection);
    
    var clickHandlers = [];
    
    var module = {
	/*
	  Pass in a function to be called every time a geometry path on the map is clicked.
	*/
	addClickHandler : function(clickHandler) {
	    clickHandlers.push(clickHandler);
	},
	redrawAll : function() {
	    var l = container.selectAll("g")
		.data(dataSource);

	    l.enter().append("g")
		.classed("leaflet-zoom-hide", true);
	    
	    l.exit().remove();

	    l.style("opacity", function(l){
		return l.options.opacity;
	    });

	    l.attr("id", function(l) {
		return l.name();
	    });

	    l.each(function(parentDatum){
		var p = d3.select(this).selectAll("path")
		    .data(function(l) {
			return l.geometry();
		    });

		p.enter().append("path")
		    .on("click", function(event, index) {
			clickHandlers.forEach(function(h){
			    h(event, index);
			});
		    });
		
		p.exit().remove();
		p.attr("d", path)
		.attr("id", function(d, i){
		    return d.id;
		});
	    });
	}
    };
    
    return module;
};


