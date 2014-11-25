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

var opacitySlider = function(selection) {
    return selection.append("input")
	.classed(opacityClass, true)
	.attr("type", "range")
	.attr("min", 0)
	.attr("max", 1)
	.attr("step", 0.05)
	.on("input", function(d, i) {
	    d.setOpacity(this.value);
	})
	.call(noDrag);
};

var baseColourPicker = function(shapes, newShapes, picker) {
    newShapes.append("span")
	.classed("choose-colour", true)
	.html("&nbsp;", true)
	.each(function(d, i) {
	    var el = d3.select(this);
	    d.worksheet.baseColourChanged(function(colour) {
		el.style("background-color", colour);
	    });
	})
	.call(noDrag);

    var colourButtons = shapes.selectAll(".choose-colour")
	    .style("background-color", function(d, i) {
		return d.worksheet.baseColour();
	    });

    picker.open(colourButtons);
};

var tables = function(shapes, newShapes) {
    newShapes.each(function(d, i) {
	var el = d3.select(this),
	    button = el.append("span")
		.classed("open-table", true)
		.text("⊞")
		.call(noDrag);

	button.each(function(d, i) {
	    d.resultsTable.dialogue().open(d3.select(this));
	});
    });
};

module.exports = function(container, toolbar, getLayers, getTileLayers, zoomTo) {
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
	baseOpacitySlider = opacitySlider(baseForm),
	tilesForm = control.append("form"),
	shapesForm = control.append("form"),

	picker = dialogue(
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

		  button.datum()
		      .worksheet
		      .baseColour(colour);
	      }));

    toolbar.add("L", dialogue);

    var updateBase = function() {
	var baseLabels = baseDiv
		.selectAll("label")
		.data(
		    getTileLayers().base.values(),
		    function(d, i) {
			return d.name();
		    });

	baseLabels.exit().remove();

	var newBaseLabels = baseLabels
		.enter()
		.append("label");

	newBaseLabels.append("input")
	    .attr("type", "radio")
	    .attr("name", "base-layer")
	    .attr("value", function(d, i) {
		return d.name();
	    })
	    .on("click", function(d, i) {
		getTileLayers().setBaseLayer(d);
	    });

	newBaseLabels.append("span")
	    .text(function(d, i) {
		return d.name();
	    });

	baseLabels.selectAll("input")
	    .attr("checked", function(d, i) {
		return d.value === getTileLayers().getBaseLayer() ? "checked" : null;
	    });

	baseOpacitySlider.datum(getTileLayers().getBaseLayer());
	
	baseOpacitySlider.node().value = getTileLayers().getBaseLayer().options.opacity;
    };

    var updateTiles = function() {
	var tileDivs = tilesForm
	    .selectAll("div")
		.data(
		    getTileLayers().overlays.values(),
		    function(d, i) {
			return d.name();
		    });

	tileDivs.exit().remove();

	var newTileDivs = tileDivs
		.enter()
		.append("div")
		.classed("tile-overlay-control", true);

	newTileDivs.append("span")
	    .text(function(d, i) {
		return d.name();
	    });

	newTileDivs.append("span")
	    .classed("tile-overlay-status", true)
	    .each(function(d, i) {
		var status = this;
		
		d.colourChanged(function(colour) {
		    status.style("background-color", colour);
		    if (d.legend) {
			status.style("color", reverseColour(colour));
			status.text(d.legend(colour));
		    }
		});
	    });

	opacitySlider(newTileDivs);

	tileDivs.selectAll("." + opacityClass)
	    .each(function(d, i) {
		this.value = d.options.opacity;
	    });
    };

    var updateShapes = function() {
	var shapes = shapesForm.selectAll("div")
		.data(
		    getLayers().sortedByZ().reverse(),
		    function(d, i) {
			return d.name();
		    });

	shapes.exit().remove();

	var newShapes = shapes.enter().append("div")
		.classed("shape-overlay-control", true);

	newShapes.append("span")
	    .classed("shape-layer-name", true)
	    .text(function(d, i) {
		return d.name();
	    })
	    .on("click", function(d, i) {
		if (d.boundingbox) {
		    zoomTo(d.boundingbox());
		}
	    })
	    .call(noDrag);

	newShapes.append("span")
	    .classed("shape-layer-delete", true)
	    .text("X")
	    .on("click", function(d, i) {
		d.remove();
	    })
	    .call(noDrag);

	opacitySlider(newShapes);

	sort(
	    newShapes,
	    function(moved, movedDown, displaced) {
		var direction = movedDown ? -1 : 1;

		getLayers().reorder(
		    [[d3.select(moved).datum().name(), direction * displaced.size()]]
			.concat(displaced.data().map(function(layer) {
			    return [layer.name(), -direction];
			}))
		);
	    }
	);

	shapes.selectAll("." + opacityClass)
	    .each(function(d, i) {
		this.value = d.options.opacity;
	    });

	shapes.order();

	baseColourPicker(shapes, newShapes, picker);

	tables(shapes, newShapes);
    };

    return {
	update: function() {
	    updateBase();
	    updateTiles();
	    updateShapes();
	}
    };
};
