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
    dialogue = require("floating-dialogue"),
    leaflet = require("leaflet"),
    colours = require("slippy-colors"),
    reverseColour = require("./colour.js").reverse,
    noDrag = require("./helpers.js").noDrag,
    sort = require("sort-children"),
    opacityClass = "opacity-slider";

var opacitySlider = function(selection, initialValue, getLayer, setOpacity) {
    return selection.append("input")
	.classed(opacityClass, true)
	.attr("type", "range")
	.attr("min", 0)
	.attr("max", 1)
	.attr("step", 0.05)
	.attr("value", initialValue)
	.on("input", function(d, i) {
	    var layer = getLayer(d, i);
	    setOpacity(layer, this.value);
	})
	.call(noDrag);
};

var baseColourPicker = function(shapes, newShapes, layers, picker) {
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

var tables = function(shapes, newShapes, leavingShapes, layers) {
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

module.exports = function(container, buttonContainer, map, layers, tileLayers, zoomTo) {
    var baseLayer = tileLayers.defaultBaseLayer,

	button = buttonContainer.append("span")
	    .text("L"),
	
	control = dialogue(container.append("div")
			   .attr("id", "layer-control"))
	    .close()
	    .drag()
	    .open(button)
	    .show()
	    .content();

    var changeBaseLayer = function(layer) {
	map.removeLayer(baseLayer);
	baseLayer = layer;
	map.addLayer(baseLayer);
	baseLayer.setOpacity(baseOpacity.node().value);
    };

    var setBaseOpacity = function(layer, o) {
	layer.setOpacity(o);
	baseOpacity.node().value = o;
    };

    var baseLayersForm = control.append("form");

    tileLayers.base.entries().forEach(function(e) {
	e.value.name = function() {
	    return e.key;
	};
    });

    var baseLayerLabels = baseLayersForm.selectAll("label")
	    .data(tileLayers.base.entries());

    baseLayerLabels
	.enter()
	.append("label")
	.append("input")
	.attr("type", "radio")
	.attr("name", "base-layer")
	.attr("value", function(d, i) {
	    return d.key;
	})
	.on("click", function(d, i) {
	    changeBaseLayer(d.value);
	});

    var updateChecked = function() {
	baseLayerLabels
	    .selectAll("input")
	    .attr("checked", function(d, i) {
		return d.value === baseLayer ? "checked" : null;
	    });
    };

    updateChecked();

    baseLayerLabels.append("span")
	.text(function(d, i) {
	    return d.key;
	});

    var baseOpacity = opacitySlider(
	baseLayersForm,
	1,
	function(d, i) {
	    return baseLayer;
	},
	setBaseOpacity
    );

    map.addLayer(baseLayer);
    
    var tileLayersForm = control.append("form");

    var setTileOverlayOpacity = function(layer, o) {
	layer.setOpacity(o);
	if (o === 0) {
	    map.removeLayer(layer);
	} else {
	    if (!map.hasLayer(layer)) {
		map.addLayer(layer);
	    }
	}
	
	tileLayerDivs.selectAll("." + opacityClass)
	    .each(function(d, i) {
		this.value = d.value.options.opacity;
	    });
    };

    var tileLayerDivs = tileLayersForm.selectAll("div")
	    .data(tileLayers.overlays.entries())
	    .enter()
	    .append("div")
	    .classed("tile-overlay-control", true);

    tileLayerDivs.append("span")
	.text(function(d, i) {
	    return d.key;
	});

    opacitySlider(
	tileLayerDivs, 
	0,
	function(d, i) {
	    return d.value;
	},
	setTileOverlayOpacity
    );

    tileLayerDivs.append("span")
	.classed("tile-overlay-status", true)
	.each(function(d, i) {
	    var status = d3.select(this),
		layer = d.value;

	    layer.colourChanged(function(colour) {
		status.style("background-color", colour);
		if (layer.legend) {
		    status.style("color", reverseColour(colour));
		    status.text(layer.legend(colour));
		}
	    });
	});

    var picker = dialogue(
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

    var shapeLayers = control.append("form");

    var setShapeOverlayOpacity = function(layer, o) {
	layer.setOpacity(o);
	
	if (parseFloat(o) === 0) {
	    layer.enabled = false;
	} else {
	    layer.enabled = true;
	}
	shapeLayers.selectAll("div ." + opacityClass)
	    .each(function(d, i) {
		this.value = d.options.opacity;
	    });

	shapeLayers.selectAll(".shape-layer-name")
	    .classed("disabled", function(d, i) {
		return !d.enabled;
	    });
    };

    var updateShapes = function() {
	var shapes = shapeLayers.selectAll("div")
		.data(
		    layers.sortedByZ().reverse(),
		    function(d, i) {
			return d.name();
		    });

	var leavingShapes = shapes.exit()
		.remove();

	var newShapes = shapes.enter().append("div")
		.classed("shape-overlay-control", true);

	newShapes.append("span")
	    .classed("shape-layer-name", true)
	    .text(function(d, i) {
		return d.name();
	    })
	    .on("click", function(d, i) {
		if (d.boundingbox) {
		    zoomTo(d.boundingbox(), map);
		}
	    })
	    .call(noDrag);

	newShapes.append("span")
	    .classed("shape-layer-delete", true)
	    .text("X")
	    .on("click", function(d, i) {
		layers.remove(d);
		updateShapes();
	    })
	    .call(noDrag);

	sort(
	    newShapes,
	    function(moved, movedDown, displaced) {
		var direction = movedDown ? -1 : 1;

		layers.reorder(
		    [[d3.select(moved).datum().name(), direction * displaced.size()]]
			.concat(displaced.data().map(function(layer) {
			    return [layer.name(), -direction];
			}))
		);
	    }
	);

	shapes.order();
	
	opacitySlider(
	    newShapes,
	    1,
	    function(d, i) {
		return d;
	    },
	    setShapeOverlayOpacity
	);

	baseColourPicker(shapes, newShapes, layers, picker);

	tables(shapes, newShapes, leavingShapes, layers);
    };

    var m = {
	baseLayer: function(name) {
	    if (name === undefined) {
		return baseLayer;
	    } else {
		if (tileLayers.base.has(name)) {
		    changeBaseLayer(tileLayers.base.get(name));
		    updateChecked();
		    return m;
		} else {
		    throw new Error("Unknown base layer " + name);
		}
	    }
	},
	setBaseOpacity: setBaseOpacity,
	setTileOverlayOpacity: setTileOverlayOpacity,
	setShapeOverlayOpacity: setShapeOverlayOpacity,
	update: updateShapes
    };
    return m;
};
