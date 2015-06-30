"use strict";

/*global module, require*/

/*
 This file is where all the mess and wiring goes.
 We should aim to reduce its size.
 */

var d3 = require("d3"),
    _ = require("lodash"),
    dialogue = require("floating-dialogue"),
    leaflet = require("leaflet"),

    body = d3.select("body"),
    menuBar = body.append("div").classed("file-menu", true),
    toolbar = body.append("div").classed("toolbar", true),

    resultsTables = dialogue(
	"results-table",
	{
	    reposition: true,
	    close: true,
	    resize: true,
	    sticky: true,
	    bringToFront: true,
	    findSpace: true,
	    lockToScreen: true
	}
    ),

    update = function() {
	draw.update();
    },
    
    errors = require("./errors.js")(toolbar, body),
    progress = require("./progress.js")(body),

    shapeLayerFactory = require("./shape-layers/shape-layer.js")(errors, resultsTables),

    map = require("./map.js")(body),
    
    tableForLayer = require("./shape-layers/table-for-layer.js")(
	body,
	map.zoomTo,
	paint.onClick,
	paint.onHover,
	update
    ),
    
    state = require("./state.js")(
	errors,
	map,
	toolbar,
	tableForLayer,
	update
    ),

    draw = require("./draw/draw.js")(body, resultsTables, state.getShapeLayers, state.getTileLayers),
    
    dataTransfer = require("./data-transfer.js")(
	shapeLayerFactory,
	errors,
	state.fresh
    ),
    
    menu = require("multiuser-file-menu")(
	"maps",
	dataTransfer.serialize,
	dataTransfer.deserialize,
	state.get,
	state.set,
	state.fresh
    ),
    
    fetchLayers = require("./shape-layers/fetch-layers.js")(
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
    require("./shape-layers/load-layer-button.js")(
	fetchLayers.collection,
	shapeLayerFactory,
	state.getShapeLayers,
	fetchLayers.load,
	menu.spec.button
    ),
    viewportButtons.set,
    viewportButtons.get
]);

require("./autosave-and-autoload.js")(
    menu.store.writeOp,
    menu.store.onOp,
    state,
    dataTransfer,
    toolbar
);

menu.queryString.fromURL();
