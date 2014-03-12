"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.paint = function(container, width, height, projection, zoom) {
    var colours = d3.scale.category20();

    var zoomer = d3.behavior.zoom()
	    .scale(1 << zoom)
	    .translate([width / 2, height / 2]);

    var zoomProjection = function() {
	projection.scale(zoomer.scale() / 2 / Math.PI)
	    .translate(zoomer.translate());
    };

    var path = d3.geo.path()
	    .projection(projection);
    
    var svg = container.append("svg")
            .attr("width", width)
	    .attr("height", height);

    var clickHandlers = [];
    var dataSource = null;
    
    var module = {
	/*
	 Call this with a function which returns SOMETHING
	 */
	setDataSource : function(source) {
	    dataSource = source;
	},

	/*
	 Pass in a function to be called every time a geometry path on the map is clicked.
	 */
	addClickHandler : function(clickHandler) {
	    clickHandlers.push(clickHandler);
	},
	redrawAll : function() {
	    if (dataSource) {
		
		zoomProjection();
		
		var l = svg.selectAll("g")
			.data(dataSource());

		l.enter().append("g")
	    	    .attr("width", width)
		    .attr("height", height)
		    .attr("id", function(l) {
			return l.name();
		    });
		
		l.exit().remove();
		var p = l.selectAll("path")
			.data(function(l) {
			    return l.geometry();
			});

		p.enter().append("path");
		p.exit().remove();
		p
		    .attr("fill", function(data, index) {
			return colours(index);
		    })
		    .on("click", function(event, index) {
			clickHandlers.forEach(function(h){
			    h(event, index);
			});
		    })
		    .attr("d", path)
		    .attr("id", function(d, i){
			return d.properties.Name;
		    });
	    }
	}
    };
    
    container.call(zoomer);
    zoomer.on("zoom", module.redrawAll);

    return module;
};


