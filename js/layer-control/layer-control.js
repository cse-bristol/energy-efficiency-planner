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
    colourPickerFactory = require("./colour-picker.js"),
    clickExpand = require("./click-to-expand.js"),
    opacitySliderFactory = require("./opacity-slider.js"),
    helpers = require("../helpers.js"),
    noop = helpers.noop,
    
    empty = d3.select(),
    overlayControlClass = "overlay-control",
    layerNameClass = "layer-name",
    toolText = "L";

module.exports = function(container, toolbar, updateTileLegendButtons, updateShapeLegendButtons, updateResultsTableButtons, getTileLayers, getShapeLayers, zoomTo, update) {
    var getBaseLayer = function(ignored) {
	    return getTileLayers().getBaseLayer();
	},

	getTileOverlayById = function(layerId) {
	    return getTileLayers().overlays.get(layerId);
	},
	
	getShapeLayerById = function(layerId) {
	    return getShapeLayers().get(layerId);
	},

	colourPicker = colourPickerFactory(getShapeLayerById, update),

	baseOpacitySlider = opacitySliderFactory(getBaseLayer, noop),
	tileOpacitySlider = opacitySliderFactory(getTileOverlayById, noop),
	shapeOpacitySlider = opacitySliderFactory(getShapeLayerById, update),
	
	dialogue = floatingDialogue(
	    "layer-control",
	    {
		reposition: true,
		close: true,
		lockToScreen: true
	    }
	).single(),
	control,
	baseForm,
	baseDiv,
	tilesForm,
	shapesForm,    

	updateBase = function(baseLayer, baseLayerNames) {
	    baseForm.datum(
		baseLayer.name()
	    );
	    
	    var baseLabels = baseDiv
		    .selectAll("label")
		    .data(
			baseLayerNames,
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

		    update();
		});

	    newBaseLabels.append("span")
		.text(function(d, i) {
		    return d;
		});

	    baseLabels.select("input")
		.attr("checked", function(d, i) {
		    return d === baseLayer.name() ? "checked" : null;
		});
	};

    var updateTiles = function(tileOverlays) {
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
	},

	drawing = dialogue.drawing(
	    container,
	    function(dialogues, newDialogues) {
		var newBaseForm = newDialogues.append("form")
			.classed("base-form", true);

		newBaseForm
		    .append("div");

		newDialogues.append("form")
		    .classed("tile-overlay-form", true);

		newDialogues.append("form")
		    .classed("shape-overlay-form", true);

		control = dialogues;

		baseForm = dialogues.select(".base-form")
		    .datum(getTileLayers().getBaseLayer().name());

		baseOpacitySlider(baseForm, newBaseForm);
		
		baseDiv = baseForm.select("div");

		tilesForm = dialogues.select(".tile-overlay-form");

		shapesForm = dialogues.select(".shape-overlay-form");

		var tileLayers = getTileLayers(),
		    shapeLayers = getShapeLayers().ordered().reverse();

		updateBase(tileLayers.getBaseLayer(), tileLayers.base.keys());
		updateTiles(tileLayers.overlays);
		updateShapes(
		    shapeLayers.map(function(layer) {
			return layer.name();
		    })
		);
	    },
	    toolbar,
	    function(buttons, newButtons) {
		newButtons.text("L");
	    }
	);

    return {
	update: drawing.update,
	save: dialogue.save,
	load: dialogue.load
    };
};
