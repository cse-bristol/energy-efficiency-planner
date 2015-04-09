"use strict";

/*global module, require*/

var d3 = require("d3"),
    handlerFactory = require("./helpers.js").callbackHandler;

module.exports = function(container, projection, dataSource) {
    var path = d3.geo.path()
	    .projection(projection),
    	onClick = handlerFactory(),
	onHover = handlerFactory();

    var module = {
	/*
	 Pass in a function to be called every time a geometry path on the map is clicked.
	 */
	onClick : onClick.add,
	onHover: onHover.add,
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
		    return l.getOpacity();
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
		    .on("click", function(d, i) {
			onClick(d.id, d.layer);
		    })
		    .on("mouseenter", function(d, i) {
			onHover(d.id, d.layer);
		    })
		    .attr("id", function(d, i){
			return d.id;
		    });
		
		p.exit().remove();

		p
		    .attr("d", path)
		    .each(function(d, i) {
			var el = d3.select(this),
			    colour = d.layer.worksheet.getColourFunction(),
			    column = d.layer.worksheet.getColourColumn(),

			    feature = function() {
				switch (d.geometry.type) {
				case "Point":
				case "MultiPoint":
				    return "fill";
				case "LineString":
				case "MultiLineString":
				    return "stroke";
				case "Polygon":
				default:
				    return "fill";
				}
			    }();
			
			el
			    .classed(d.geometry.type, true)
			    .style(feature, function(d, i) {
				return colour(
				    d.layer.worksheet.getShapeData(d, column));
			    });
		    });
	    });

	    l.order();
	}
    };
    
    return module;
};


