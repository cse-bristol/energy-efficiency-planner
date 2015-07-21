"use strict";

/*global module, require*/

/*
 This file is where all the mess and wiring goes.
 We should aim to reduce its size.
 */

var d3 = require("d3"),
    _ = require("lodash"),
    leaflet = require("leaflet"),

    body = d3.select("body"),
    leftPane = body.append("div")
	.attr("id", "left-pane"),
    rightPane = body.append("div"),
    menuBar = leftPane.append("div").classed("file-menu", true),
    toolbar = leftPane.append("div").classed("toolbar", true),

    update = function() {
	draw.update();
    },

    serialize = function() {
	return serialization.serialize.apply(this, arguments);
    },

    deserialize = function() {
	return serialization.deserialize.apply(this, arguments);
    },
    
    progress = require("./progress.js")(body),

    errors = require("./errors.js")(toolbar, leftPane),    

    map = require("./map.js")(leftPane),
    
    state = require("./state/state.js")(
	errors,
	map,
	update
    ),

    legend = require("./legend/legend.js")(body, state.getTileLayers, state.getShapeLayers, state.onSet),

    resultsTables = require("./results-tables/results-tables.js")(body, state.getShapeLayers, update),

    layerControl = require("./layer-control/layer-control.js")(
	leftPane,
	rightPane,
	toolbar,
	legend.tileButtons,
	legend.shapeButtons,
	resultsTables.updateButtons,
	state.getTileLayers,
	state.getShapeLayers,
	state.onSet,
	map.zoomTo,
	update
    ),

    draw = require("./draw/draw.js")(
	leftPane,
	resultsTables,
	legend.update,
	layerControl.update,
	state.getTileLayers,
	state.getShapeLayers,
	map
    ),

    shapeLayerFactory = require("./state/shape-layers/shape-layer.js")(errors, resultsTables.createData, legend.shapeCreate),

    menu = require("multiuser-file-menu")(
	"maps",
	serialize,
	deserialize,
	state.get,
	state.set,
	state.fresh
    ),

    shapeLayerSerialization = require("./serialization/serialize-shape-layer.js")(
	shapeLayerFactory,
	resultsTables.deserialize,
	legend.shapeDeserialize,
	update
    ),
    
    fetchLayers = require("./state/shape-layers/fetch-layers.js")(
	menu.backend.load,
	menu.backend.loadSnapshot,
	shapeLayerSerialization.onDeserializeLayer,
	progress,
	errors
    ),

    importControl = require("./serialization/files/import.js")(
	toolbar,
	leftPane,
	state,
	shapeLayerFactory,
	fetchLayers.save,
	errors,
	progress,
	update
    ),

    serialization = require("./serialization/serialize.js")(
	shapeLayerSerialization.serialize,
	shapeLayerSerialization.deserialize,
	legend.tileDeserialize,
	errors,
	layerControl,
	importControl,
	state.fresh
    ),    
    
    viewportButtons = require("./viewport-buttons.js")(
	map.setView,
	map.getCenter,
	map.getZoom,
	state.getViewport,
	menu.spec.button,
	update
    ),

    standardButtonsWithoutAuto = menu.standard.buttonSpec().filter(function(button) {
	return button.text !== "Auto";
    });

menu.buildCustomMenu(
    menuBar,
    standardButtonsWithoutAuto.concat([
	require("./state/shape-layers/load-layer-button.js")(
	    fetchLayers.collection,
	    shapeLayerFactory,
	    state.getShapeLayers,
	    fetchLayers.load,
	    menu.spec.button,
	    update
	),
	viewportButtons.set,
	viewportButtons.get
    ])
);

menu.queryString.fromURL();
