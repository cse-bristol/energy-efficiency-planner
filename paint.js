"use strict";

/*global module, require*/

var d3 = require("d3");

module.exports = function(container, projection, dataSource) {
    var path = d3.geo.path()
	    .projection(projection),
	colours = d3.scale.category10(),
    	clickHandlers = [];
    
    var module = {
	/*
	 Pass in a function to be called every time a geometry path on the map is clicked.
	 */
	addClickHandler : function(clickHandler) {
	    clickHandlers.push(clickHandler);
	},
	redrawAll : function() {
	    var l = container.selectAll("g")
		    .data(
			dataSource, 
			function(d, i) {
			    // Layers should be unique.
			    return d.name();
			}
		    );

	    l.enter().append("g")
		.classed("leaflet-zoom-hide", true);
	    
	    l.exit().remove();

	    l
		.style("opacity", function(l){
		    return l.options.opacity;
		})
		.style("fill", function(d, i) {
		    return colours(i);
		})
		.attr("id", function(l) {
		    return l.name();
		});

	    l.each(function(parentDatum){
		var p = d3.select(this).selectAll("path")
			.data(
			    function(l) {
				return l.geometry();
			    },
			    function(d, i) {
				// Layer + id combination should be unique.
				return d.key;
			    });

		p.enter().append("path")
		    .on("click", function(event, index) {
			clickHandlers.forEach(function(h){
			    h(event, index);
			});
		    })
		    .attr("id", function(d, i){
			return d.id;
		    });
		
		p.exit().remove();

		p
		    .attr("d", path)
		    .each(function(d, i) {
			var el = d3.select(this),
			    colour = d.layer.worksheet.baseColour(),
			    feature = undefined;

			switch (d.geometry.type) {
			case "Point":
			case "MultiPoint":
			    feature = "fill";
			    break;
			case "LineString":
			case "MultiLineString":
			    feature = "stroke";
			    break;
			case "Polygon":
			default:
			    feature = "fill";
			    break;
			}
			
			el
			    .classed(d.geometry.type, true)
			    .style(feature, colour);
		    });
	    });
	}
    };
    
    return module;
};


