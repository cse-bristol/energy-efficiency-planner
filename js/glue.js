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
    menuBar = body.append("div").classed("file-menu", true),
    toolbar = body.append("div").classed("toolbar", true),

    update = function() {
	draw.update();
    },
    
    errors = require("./errors.js")(toolbar, body),
    progress = require("./progress.js")(body),

    map = require("./map.js")(body),
    
    state = require("./state/state.js")(
	errors,
	map,
	toolbar,
	update
    ),

    legend = require("./legend/legend.js")(body, state.getTileLayers, state.getShapeLayers, state.onSet),

    resultsTables = require("./results-tables/results-tables.js")(body, state.getShapeLayers),

    layerControl = require("./layer-control/layer-control.js")(body, toolbar, legend.tileButtons, legend.shapeButtons, resultsTables.updateButtons, state.getTileLayers, state.getShapeLayers, map.zoomTo),

    draw = require("./draw/draw.js")(
	body,
	resultsTables,
	legend.update,
	layerControl.update,
	state.getTileLayers,
	state.getShapeLayers,
	map
    ),

    shapeLayerFactory = require("./state/shape-layers/shape-layer.js")(errors, resultsTables.createData, legend.shapeCreate),
    
    dataTransfer = require("./serialization/data-transfer.js")(
	shapeLayerFactory,
	errors,
	state.fresh,
	resultsTables.deserialize
    ),
    
    menu = require("multiuser-file-menu")(
	"maps",
	dataTransfer.serialize,
	dataTransfer.deserialize,
	state.get,
	state.set,
	state.fresh
    ),
    
    fetchLayers = require("./state/shape-layers/fetch-layers.js")(
	menu.backend.load,
	menu.backend.loadSnapshot,
	dataTransfer.onDeserializeLayer,
	progress,
	errors
    ),
    
    viewportButtons = require("./viewport-buttons.js")(
	map.setView,
	map.getCenter,
	map.getZoom,
	state.getViewport,
	menu.spec.button,
	update
    );

require("./serialization/files/import.js")(
    toolbar,
    body,
    state,
    shapeLayerFactory,
    fetchLayers.save,
    errors,
    progress
);

menu.buildMenu(menuBar, [
    require("./state/shape-layers/load-layer-button.js")(
	fetchLayers.collection,
	shapeLayerFactory,
	state.getShapeLayers,
	fetchLayers.load,
	menu.spec.button
    ),
    viewportButtons.set,
    viewportButtons.get
]);

require("./serialization/autosave-and-autoload.js")(
    menu.store.writeOp,
    menu.store.onOp,
    state,
    dataTransfer,
    toolbar
);

menu.queryString.fromURL();
