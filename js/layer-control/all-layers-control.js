"use strict";

/*global module, require*/

var d3 = require("d3"),
    shape = "shape",
    tile = "tile";

module.exports = function(container, getTileLayers, getShapeLayers, fetchShapeLayer, shapeLayerFactory, search, errors, update) {
    var doSearch =  function() {
	var text = searchBox.node().value;

	search(
	    fetchShapeLayer.collection,
	    text,
	    function(names) {
		if (text === searchBox.node().value) {
		    var regex = new RegExp(".*" + text + ".*"),
			tileMatches = getTileLayers().availableOverlays.keys()
			    .filter(function(tileOverlayName) {
				return regex.test(tileOverlayName);
			    })
			    .map(function(tileOverlayName) {
				return {
				    name: tileOverlayName,
				    type: tile
				};
			    });
		    
		    var results = searchResults.selectAll(".search-result")
			    .data(
				tileMatches.concat(
				    names.map(function(n) {
					return {
					    name: n,
					    type: shape
					};
				    })
				)
			    );

		    results.exit().remove();

		    results.enter().append("div")
			.classed("search-result", true)
			.on("click", function(d, i) {
			    switch(d.type) {
			    case shape:
				var shapeLayers = getShapeLayers();
				if (shapeLayers.has(d.name)) {
				    shapeLayers.remove(
					shapeLayers.get(d.name)
				    );
				    update();
				    
				} else {
				    fetchShapeLayer.load(
					d.name,
					function(geometry, bbox) {
					    getShapeLayers().add(
						shapeLayerFactory(d.name, geometry, bbox)
					    );
					    update();
					}
				    );
				}

				break;
				
			    case tile:
				var tileLayers = getTileLayers();
				if (tileLayers.overlays.has(d.name)) {
				    tileLayers.removeOverlay(d.name);
				} else {
				    tileLayers.addOverlay(d.name);
				}
				update();
				break;

			    default:
				throw new Error("Unknown layer type " + d.type);
			    }
			});

		    results.text(function(d, i) {
			return d.name;
		    })
		    	.classed("built-in-tile", function(d, i) {
			    return d.type === tile;
			});
		    
		    results.order();
		}
	    },
	    function(error) {
		errors.warnUser(error);
	    }
	);
    },

	searchBox = container.append("input")
	    .attr("type", "text")
	    .attr("placeholder", "Find")
	    .on("input", doSearch),

	searchResults = container.append("div");

    doSearch();
    
    return {
	update: function(tileLayerNames, shapeLayerNames) {
	    searchResults.selectAll(".search-result")
		.classed("enabled", function(d, i) {
		    switch (d.type) {
		    case shape:
			return shapeLayerNames.indexOf(d.name) >= 0;
			
		    case tile:
			return tileLayerNames.indexOf(d.name) >= 0;

		    default:
			throw new Error("Unknown layer type " + d.type);
		    }
		});
	}
    };
};
