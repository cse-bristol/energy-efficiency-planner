"use strict";

/*global module, require*/

var d3 = require("d3"),
    sort = require("sort-children"),

    colourPickerFactory = require("./colour-picker.js"),
    clickExpand = require("./click-to-expand.js"),
    opacitySliderFactory = require("./opacity-slider.js"),

    helpers = require("../helpers.js"),
    noop = helpers.noop,

    overlayControlClass = "overlay-control",
    layerNameClass = "layer-name";

module.exports = function(updateTileLegendButtons, updateShapeLegendButtons, updateResultsTableButtons, getTileLayers, getShapeLayers, container, zoomTo, update) {
    var getTileOverlayById = function(layerId) {
	return getTileLayers().overlays.get(layerId);
    },
	
	getShapeLayerById = function(layerId) {
	    return getShapeLayers().get(layerId);
	},
	
	colourPicker = colourPickerFactory(getShapeLayerById, update),

	tileOpacitySlider = opacitySliderFactory(getTileOverlayById, noop),
	shapeOpacitySlider = opacitySliderFactory(getShapeLayerById, update),
	
	tilesForm = container.append("form")
	    .classed("tile-overlay-form", true),
	shapesForm = container.append("form")
	    .classed("shape-overlay-form", true),

	updateTiles = function(tileOverlays) {
	    var tileDivs = tilesForm
		    .selectAll("div")
		    .data(
			tileOverlays.keys(),
			function(d, i) {
			    return d;
			});

	    tileDivs.exit().remove();

	    var newTileDivs = tileDivs
		    .enter()
		    .append("div")
		    .classed(overlayControlClass, true);

	    newTileDivs.append("span")
		.classed(layerNameClass, true)
		.text(function(d, i) {
		    return d;
		});

	    newTileDivs.call(clickExpand);

	    tileOpacitySlider(tileDivs, newTileDivs);
	    updateTileLegendButtons(tileDivs);
	},

	updateShapes = function(shapeLayerNames) {
	    var shapes = shapesForm.selectAll("div")
		    .data(
			shapeLayerNames,
			function(d, i) {
			    return d;
			});

	    shapes.exit().remove();

	    var newShapes = shapes.enter().append("div")
		    .classed(overlayControlClass, true);

	    newShapes.append("span")
		.classed(layerNameClass, true)
		.classed("shape-" + layerNameClass, true)
		.text(function(d, i) {
		    return d;
		})
		.on("click", function(d, i) {
		    d3.event.stopPropagation();
		    
	    	    var layer = getShapeLayerById(d);
	    	    if (layer.boundingbox) {
	    		zoomTo(layer.boundingbox());
	    	    }
		});

	    newShapes
		.call(clickExpand);	

	    sort(
		newShapes,
		function(moved, from, to) {
		    getShapeLayers().moveLayer(
			d3.select(moved).datum(),
			from,
			to
		    );
		    update();
		}
	    );

	    shapes.order();

	    colourPicker(shapes, newShapes);
	    updateShapeLegendButtons(shapes);
	    updateResultsTableButtons(shapes);

	    newShapes.append("span")
		.classed("shape-layer-delete", true)
		.text("X")
		.on("click", function(d, i) {
		    var layers = getShapeLayers();
		    layers.remove(
			layers.get(d)
		    );

		    update();
		});
	    
	    shapeOpacitySlider(shapes, newShapes);
	};	

    return {
	update: function(tileOverlays, orderedShapeLayerNames) {
	    updateTiles(tileOverlays);
	    updateShapes(orderedShapeLayerNames);
	}
    };
};
