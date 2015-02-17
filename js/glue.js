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
    map = require("./map.js")(body),
    paint = require("./paint.js")(
	map.overlay,
	map.projectTile,
	function() {
	    return state.getShapeLayers().ordered().reverse();
	}
    ),
    shapeLayerFactory = require("./shape-layers/shape-layer.js")(errors),
    
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
    
    dataTransfer = require("./data-transfer.js")(
	shapeLayerFactory,
	errors,
	state.fresh
    ),
    
    legend = require("./legend.js")(
	body,
	toolbar,
	state.getShapeLayers,
	state.getTileLayers
    ),
    
    layerControl = require("./layer-control.js")(
	body,
	toolbar,
	state.getShapeLayers,
	state.getTileLayers,
	map.zoomTo),
    
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
	dataTransfer.onDeserializeLayer,
	progress
    ),
    
    viewportButtons = require("./viewport-buttons.js")(
	map.setView,
	map.getCenter,
	map.getZoom,
	state.getViewport,
	menu.spec.button,
	update
    );

require("./files/import.js")(
    toolbar,
    body,
    state,
    shapeLayerFactory,
    fetchLayers.save,
    update,
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

map.onViewReset(update);

menu.queryString.fromURL();
