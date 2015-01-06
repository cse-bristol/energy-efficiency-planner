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
	paint.redrawAll();
    },
    
    toolbar = require("./toolbar.js")(body),
    errors = require("./errors.js")(body, toolbar),
    loader = require("./loader.js"),
    geometries = require("./geometries.js"),
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
	state.onSet
    );

menu.buildMenu(menuBar, [
    require("./load-layer-button.js")(
	fetchLayers.collection,
	state.getLayers,
	fetchLayers.load,
	menu.spec.button
    )
]);

map.onViewReset(paint.redrawAll);

var handlers = require("./file-handlers.js")(
    errors, 
    geometries, 
    state.getLayers, 
    update
);
require("./file-drop.js")(d3.select("body"), errors, handlers);
require("./model-operations.js")(
    menu.store.writeOp,
    state.onSet,
    state.getTileLayers,
    state.getLayers,
    toolbar,
    dataTransfer.serializeShapeLayer,
    state.loading
);
