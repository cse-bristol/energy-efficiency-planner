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
    update = function() {
	layerControl.update();
	legend.update();
	paint.redrawAll();
    },
    
    toolbar = require("./toolbar.js")(body),
    errors = require("./errors.js")(body, toolbar),
    progress = require("./progress.js")(body),
    loader = require("./loader.js"),
    map = require("./map.js")(body),
    paint = require("./paint.js")(
	map.overlay,
	map.projectTile,
	function() {
	    return state.getLayers().sortedByZ();
	}
    ),
    tableForLayer = require("./table/table-for-layer.js")(
	body,
	map.zoomTo,
	paint.onClick,
	paint.onHover,
	update
    ),    
    state = require("./state.js")(errors, map, toolbar, tableForLayer, update),
    dataTransfer = require("./data-transfer.js")(errors, state.fresh),
    legend = require("./legend.js")(body, toolbar, state.getLayers, state.getTileLayers),
    layerControl = require("./layer-control.js")(body, toolbar, state.getLayers, state.getTileLayers, map.zoomTo),    
    menu = require("multiuser-file-menu")(
	"maps",
	dataTransfer.serialize,
	dataTransfer.deserialize,
	state.get,
	state.set,
	state.fresh
    ),
    fetchLayers = require("./fetch-layers.js")(
	menu.backend.isUp,
	menu.backend.waitForConnect,
	menu.backend.load,
	dataTransfer.onDeserializeLayer,
	state.getLayers,
	progress
    ),
    viewportButtons = require("./viewport-buttons.js")(
	map.setView,
	map.getCenter,
	map.getZoom,
	state.getViewport,
	menu.spec.button
    );

menu.buildMenu(menuBar, [
    require("./load-layer-button.js")(
	fetchLayers.collection,
	state.getLayers,
	fetchLayers.load,
	menu.spec.button
    ),
    viewportButtons.set,
    viewportButtons.get
]);

map.onViewReset(paint.redrawAll);
map.onViewReset(legend.update);

var fileImportDialogue = require("./files/import-dialogue.js")(
    toolbar,
    body,
    state.getLayers,
    fetchLayers.save,
    update
),
    handlers = require("./files/file-handlers.js")(
	errors, 
	fileImportDialogue
    );
require("./files/file-drop.js")(d3.select("body"), errors, handlers);
require("./autosave-and-autoload.js")(
    menu.store.writeOp,
    menu.store.onOp,
    state,
    dataTransfer,
    toolbar
);
