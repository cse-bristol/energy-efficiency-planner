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
    colours = require("slippy-colors"),
    reverseColour = require("./colour.js").reverse,
    noDrag = require("./helpers.js").noDrag,
    sort = require("sort-children"),
    opacityClass = "opacity-slider";

var opacitySlider = function(selection, getLayer) {
    return selection.append("input")
	.classed(opacityClass, true)
	.attr("type", "range")
	.attr("min", 0)
	.attr("max", 1)
	.attr("step", 0.05)
	.on("input", function(d, i) {
	    getLayer(d).setOpacity(this.value);
	})
	.call(noDrag);
};

var baseColourPicker = function(shapes, newShapes, picker, getShapeLayers) {
    newShapes.append("span")
	.classed("choose-colour", true)
	.html("&nbsp;", true)
	.each(function(d, i) {
	    var el = d3.select(this),
		layer = getShapeLayers().get(d);

	    if (layer) {
		layer.worksheet.baseColourChanged(
		    function(colour) {
			el.style("background-color", colour);
		    }
		);
	    }
	})
	.call(noDrag);

    var colourButtons = shapes.selectAll(".choose-colour")
	    .style("background-color", function(d, i) {
		return getShapeLayers().get(d)
		    .worksheet.baseColour();
	    });

    picker.open(colourButtons);
};

var tables = function(shapes, newShapes, getShapeLayers) {
    newShapes.each(function(d, i) {
	var el = d3.select(this),
	    button = el.append("span")
		.classed("open-table", true)
		.text("⊞")
		.call(noDrag);

	button.each(function(d, i) {
	    getShapeLayers().get(d)
		.resultsTable.dialogue().open(d3.select(this));
	});
    });
};

module.exports = function(container, toolbar, getShapeLayers, getTileLayers, zoomTo) {
    var dialogue = floatingDialogue(
	container.append("div")
	    .attr("id", "layer-control"))
	    .close()
	    .drag()
	    .show(),
	
	control = dialogue
	    .content(),

	baseForm = control.append("form"),
	baseDiv = baseForm.append("div"),
	baseOpacitySlider = opacitySlider(baseForm, function() {
	    return getTileLayers().getBaseLayer();
	}),
	tilesForm = control.append("form"),
	shapesForm = control.append("form"),

	picker = floatingDialogue(
	    container.append("div")
		.classed("colour-picker", true))
	    .drag()
	    .close()
	    .hide();

    picker
	.content()
	.call(colours()
	      .width(200)
	      .height(200)
	      .on("mouseup", function(colour) {
		  var button = picker.currentOpenButton()
			  .style("background-color", colour);

		  getShapeLayers().get(button.datum())
		      .worksheet
		      .baseColour(colour);
	      }));

    toolbar.add("L", dialogue);

    var updateBase = function() {
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

	baseLabels.selectAll("input")
	    .attr("checked", function(d, i) {
		return d === getTileLayers().getBaseLayer().name() ? "checked" : null;
	    });

	baseOpacitySlider.datum(getTileLayers().getBaseLayer().name());
	
	baseOpacitySlider.node().value = getTileLayers().getBaseLayer().getOpacity();
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
		.classed("tile-overlay-control", true);

	newTileDivs.append("span")
	    .text(function(d, i) {
		return d;
	    });

	opacitySlider(newTileDivs, function(name) {
	    return getTileLayers().overlays.get(name);
	});

	tileDivs.selectAll("." + opacityClass)
	    .each(function(d, i) {
		this.value = getTileLayers().overlays.get(d)
		    .getOpacity();
	    });
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
		.classed("shape-overlay-control", true);

	newShapes.append("span")
	    .classed("shape-layer-name", true)
	    .text(function(d, i) {
		return d;
	    })
	    .on("click", function(d, i) {
		var layer = getShapeLayers().get(d);
		if (layer.boundingbox) {
		    zoomTo(layer.boundingbox());
		}
	    })
	    .call(noDrag);

	newShapes.append("span")
	    .classed("shape-layer-delete", true)
	    .text("X")
	    .on("click", function(d, i) {
		var layer = getShapeLayers().get(d);
		getShapeLayers().remove(layer);
	    })
	    .call(noDrag);

	opacitySlider(newShapes, function(name) {
	    return getShapeLayers().get(name);
	});

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

	shapes.selectAll("." + opacityClass)
	    .each(function(d, i) {
		var layer = getShapeLayers().get(d);
		this.value = layer.getOpacity();
	    });

	shapes.order();

	baseColourPicker(shapes, newShapes, picker, getShapeLayers);

	tables(shapes, newShapes, getShapeLayers);
    };

    return {
	update: function() {
	    updateBase();
	    updateTiles();
	    updateShapes();
	}
    };
};
