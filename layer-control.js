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
    noDrag = require("./helpers.js").noDrag,
    tileLayers = require("./tile-layers.js"),
    opacityClass = "opacity-slider";

var log2 = function(n) {
    return Math.log(n) / Math.LN2;
};

var opacitySlider = function(selection, initialValue, getLayer) {
    return selection.append("input")
	.classed(opacityClass, true)
	.attr("type", "range")
	.attr("min", 0)
	.attr("max", 1)
	.attr("step", 0.05)
	.attr("value", initialValue)
	.on("input", function(d, i) {
	    var layer = getLayer(d, i);
	    layer.setOpacity(this.value);
	})
	.call(noDrag);
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

module.exports = function(container, buttonContainer, map, layers, selectLayer) {
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
	}
    );

    map.addLayer(baseLayer);
    
    var tileLayersForm = control.append("form");

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
	}
    );

    var shapeLayers = control.append("form");

    var updateShapes = function() {
	var shapes = shapeLayers.selectAll("div")
	    .data(
		layers.names(),
		function(d, i) {
		    return d;
		});

	shapes.exit().remove();
	var newShapes = shapes.enter().append("div");

	newShapes.append("span")
	    .classed("shape-layer-name", true)
	    .text(function(d, i) {
		return d;
	    })
	    .on("click", function(d, i) {
		selectLayer(d);
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
	    }
	);
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
	setBaseOpacity: function(layer, o) {
	    layer.setOpacity(o);
	    baseOpacity.node().value = o;
	},
	setTileOverlayOpacity: function(layer, o) {
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
	},
	setShapeOverlayOpacity: function(layer, o) {
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
	},
	update: updateShapes
    };
    return m;
};