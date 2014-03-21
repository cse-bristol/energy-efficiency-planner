"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.paint = function(container, width, height, projection, zoom, dataSource) {
    var zoomer = d3.behavior.zoom()
	    .scale(1 << zoom)
	    .translate([width() / 2, height() / 2]);

    var zoomProjection = function() {
	projection.scale(zoomer.scale() / 2 / Math.PI)
	    .translate(zoomer.translate());
    };

    var path = d3.geo.path()
	    .projection(projection);
    
    var svg = container.append("svg")
            .attr("width", width())
	    .attr("height", height());

    var clickHandlers = [];
    
    var module = {
	/*
	 Pass in a function to be called every time a geometry path on the map is clicked.
	 */
	addClickHandler : function(clickHandler) {
	    clickHandlers.push(clickHandler);
	},
	redrawAll : function() {
	    zoomProjection();

	    svg
		.attr("width", width())
		.attr("height", height());
	    
	    var l = svg.selectAll("g")
		    .data(dataSource);

	    l.enter().append("g")
	    	.attr("width", width())
		.attr("height", height())
		.attr("id", function(l) {
		    return l.name();
		});
	    
	    l.exit().remove();

	    l.each(function(parentDatum){
		var p = d3.select(this).selectAll("path")
			.data(function(l) {
			    return l.geometry();
			});

		p.enter().append("path");
		p.exit().remove();
		p
		    .on("click", function(event, index) {
			clickHandlers.forEach(function(h){
			    h(event, index);
			});
		    })
		    .attr("d", path)
		    .datum(function(d, i){
			d.layer = parentDatum.name();
			return d;
		    })
		    .attr("id", function(d, i){
			return d.properties.Name;
		    });
	    });
	}
    };
    
    container.call(zoomer);
    zoomer.on("zoom", module.redrawAll);

    return module;
};


