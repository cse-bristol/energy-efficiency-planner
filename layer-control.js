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
    noDrag = require("./helpers.js").noDrag,
    tileLayers = require("./tile-layers.js"),
    opacityClass = "opacity-slider";

var log2 = function(n) {
    return Math.log(n) / Math.LN2;
};

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
	    layers.get(d).worksheet.baseColourChanged(function(colour) {
		el.style("background-color", colour);
	    });
	});

    var colourButtons = shapes.selectAll(".choose-colour")
	    .style("background-color", function(d, i) {
		return layers.get(d).worksheet.baseColour();
	    });

    picker.open(colourButtons);
};

var tables = function(shapes, newShapes, leavingShapes, layers) {
    newShapes.each(function(d, i) {
	var el = d3.select(this),
	    button = el.append("span")
		.classed("open-table", true)
		.text("⊞");

	button.each(function(d, i) {
	    layers.get(d).resultsTable.dialogue().open(d3.select(this));
	});
    });
};

var zoomToLayer = function(l, map) {
    if (l.boundingbox()) {
	var x1 = l.boundingbox()[0],
	    y1 = l.boundingbox()[1],
	    x2 = l.boundingbox()[2],
	    y2 = l.boundingbox()[3];

	var boxSize = Math.max(
	    Math.abs(x1 - x2),
	    Math.abs(y1 - y2));

	var newZoom = Math.round(
	    log2(360 / boxSize) + 1.5);
	console.log("new zoom " + newZoom);
	console.log("new bounds " + [(y1 + y2) / 2, (x1 + x2) / 2]);
	
	map.setView(
	    leaflet.latLng(
		(y1 + y2) / 2,
		(x1 + x2) / 2),
	    newZoom);
    }
};

module.exports = function(container, buttonContainer, map, layers) {
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
	    .append("div");

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

		  layers.get(button.datum())
		      .worksheet
		      .baseColour(colour);
	      }));

    var shapeLayers = control.append("form");

    var setShapeOverlayOpacity = function(layer, o) {
	layer.setOpacity(o);
	
	if (o === 0) {
	    layer.enabled = false;
	} else {
	    layer.enabled = true;
	}
	shapeLayers.selectAll("div ." + opacityClass)
	    .each(function(d, i) {
		this.value = layers.get(d).options.opacity;
	    });
    };

    var updateShapes = function() {
	var shapes = shapeLayers.selectAll("div")
		.data(
		    layers.names(),
		    function(d, i) {
			return d;
		    });

	var leavingShapes = shapes.exit()
		.remove();

	var newShapes = shapes.enter().append("div")
		.classed("shape-overlay-control", true);

	newShapes.append("span")
	    .classed("shape-layer-name", true)
	    .text(function(d, i) {
		return d;
	    })
	    .on("click", function(d, i) {
		zoomToLayer(layers.get(d), map);
	    });

	newShapes.append("span")
	    .classed("shape-layer-delete", true)
	    .text("X")
	    .on("click", function(d, i) {
		layers.remove(layers.get(d));
		updateShapes();
	    });
	
	opacitySlider(
	    newShapes,
	    1,
	    function(d, i) {
		return layers.get(d);
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