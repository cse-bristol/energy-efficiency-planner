"use strict";

/*global module, require*/

/*
 Provides a widget from which layers in the map may be adjusted. Divided into:
 + Tiled base layers
 + Tiled overlays
 + Shape overlays

 One base layer may be selected at a time. There is one opacity slider the base layer.
 Overlays have individual opacity sliders.
 Shape overlays may be added and removed.
 Shape overlays may be clicked on to zoom to their current location.
 */

var d3 = require("d3"),
    floatingDialogue = require("floating-dialogue"),
    leaflet = require("leaflet"),
    sort = require("sort-children"),    
    colourPicker = require("./colour-picker.js"),
    clickExpand = require("./click-to-expand.js"),
    opacitySlider = require("./opacity-slider.js"),
    legendButton = require("./legend-button.js"),
    tableButton = require("./table-button.js"),
    empty = d3.select(),
    overlayControlClass = "overlay-control",
    layerNameClass = "layer-name";

module.exports = function(container, toolbar, getShapeLayers, getTileLayers, zoomTo) {
    var dialogue = floatingDialogue(
	container.append("div")
	    .attr("id", "layer-control"))
	    .close()
	    .drag()
	    .show(),
	
	control = dialogue
	    .content(),

	baseForm = control.append("form").datum(getTileLayers().getBaseLayer().name()),
	baseDiv = baseForm.append("div"),
	tilesForm = control.append("form"),
	shapesForm = control.append("form"),
	
	getShapeLayerById = function(layerId) {
	    return getShapeLayers().get(layerId);
	},

	getTileOverlayById = function(layerId) {
	    return getTileLayers().overlays.get(layerId);
	};

    opacitySlider(baseForm, baseForm, function(noIdRequiredHere) {
	return getTileLayers().getBaseLayer();
    });

    toolbar.add("L", dialogue);

    var updateBase = function() {
	baseForm.datum(getTileLayers().getBaseLayer().name());
	
	var baseLabels = baseDiv
		.selectAll("label")
		.data(
		    getTileLayers().base.keys(),
		    function(d, i) {
			return d;
		    });

	baseLabels.exit().remove();

	var newBaseLabels = baseLabels
		.enter()
		.append("label");

	newBaseLabels.append("input")
	    .attr("type", "radio")
	    .attr("name", "base-layer")
	    .attr("value", function(d, i) {
		return d;
	    })
	    .on("click", function(d, i) {
		var tileLayers = getTileLayers();
		tileLayers.setBaseLayer(
		    tileLayers.base.get(d));
	    });

	newBaseLabels.append("span")
	    .text(function(d, i) {
		return d;
	    });

	baseLabels.select("input")
	    .attr("checked", function(d, i) {
		return d === getTileLayers().getBaseLayer().name() ? "checked" : null;
	    });

	opacitySlider(baseForm, empty, function(noIdRequiredHere) {
	    return getTileLayers().getBaseLayer();
	});
    };

    var updateTiles = function() {
	var tileDivs = tilesForm
		.selectAll("div")
		.data(
		    getTileLayers().overlays.keys(),
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

	opacitySlider(tileDivs, newTileDivs, getTileOverlayById);
	legendButton(tileDivs, newTileDivs, getTileOverlayById);
    };

    var updateShapes = function() {
	var shapes = shapesForm.selectAll("div")
		.data(
		    getShapeLayers()
			.ordered()
			.map(function(layer) {
			    return layer.name();
			}),
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
	    }
	);

	shapes.order();

	colourPicker(shapes, newShapes, getShapeLayerById);
	legendButton(shapes, newShapes, getShapeLayerById);
	tableButton(shapes, newShapes, getShapeLayerById);

	newShapes.append("span")
	    .classed("shape-layer-delete", true)
	    .text("X")
	    .on("click", function(d, i) {
		var layers = getShapeLayers();
		layers.remove(
		    layers.get(d));
	    });
	
	opacitySlider(shapes, newShapes, getShapeLayerById);
    };

    return {
	update: function() {
	    updateBase();
	    updateTiles();
	    updateShapes();
	}
    };
};
