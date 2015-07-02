"use strict";

/*global module, require*/

var d3 = require("d3");

module.exports = function(container, projection, getHoveredShape, setHoveredShape, getShapeLayers) {
    var path = d3.geo.path()
	    .projection(projection),

	updateEmphasis = function(shapeLayers) {
	    shapeLayers
		.select("path")
	    	.classed("highlight", function(d, i) {
		    return d.layer.name === getHoveredShape().layerId && d.shape.id === getHoveredShape().shapeId;
		});
	},

	drawPaths = function(shapeLayers) {
	    var p = shapeLayers.selectAll("path")
		    .data(
			function(d, i) {
			    return d.geometry()
				.map(function(shape) {
				    return {
					layer: d,
					shape: shape
				    };
				});
			},
			function(d, i) {
			    // Layer + id combination should be unique.
			    return d.shape.key;
			}
		    );

	    p.exit().remove();

	    p.enter().append("path")
		.attr("id", function(d, i) {
		    return d.shape.id;
		})
		.on("click", function(d, i) {
		    getShapeLayers()
			.get(p.layer.name)
			.worksheet
			.selectShape(
			    d.shape.id
			);
		})
		.on("mouseenter", function(d, i) {
		    setHoveredShape(d.layer.name, d.shape.id);
		});

	    p
	    	.attr("d", function(d, i) {
		    return path(d.shape);
		})
		.each(function(d, i) {
		    var el = d3.select(this),
			colour = d.layer.worksheet.getColourFunction(),
			column = d.layer.worksheet.getColourColumn(),

			feature = function() {
			    switch (d.shape.geometry.type) {
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
			.classed(d.shape.geometry.type, true)
			.style(feature, function(d, i) {
			    return colour(
				column ? d.layer.worksheet.getShapeData(d, column) : null
			    );
			});
		});

	    updateEmphasis(p);
	},

	fromSelection = function(shapeLayers, newShapeLayers) {
	    newShapeLayers = newShapeLayers
		.append("g")
	    	.classed("leaflet-zoom-hide", true);

	    shapeLayers
		.style("opacity", function(l){
		    return l.getOpacity();
		})
		.attr("id", function(l) {
		    return l.name();
		});

	    shapeLayers.order();

	    drawPaths(shapeLayers);
	};

    return {
	fromData: function(data) {
	    var l = container
		    .selectAll("g")
		    .data(
			data, 
			function(d, i) {
			    // Layers should be unique.
			    return d.name();
			}
		    );

	    l.exit().remove();

	    fromSelection(l, l.enter());
	},

	fromSelection: fromSelection,

	updateEmphasis: updateEmphasis,

	selectShapeAndLayer: function(layerId, shapeId) {
	    return container.select("g#" + layerId)
		.select("path#" + shapeId);
	}
    };
};


