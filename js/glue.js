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
    mapDiv = body.append("div").attr("id", "map"),
    toolbar = require("./toolbar.js")(body),
    errors = require("./errors.js")(body, toolbar),
    loader = require("./loader.js"),
    geometries = require("./geometries.js"),
    dataTransfer = require("./data-transfer.js"),
    map = require("./map.js")(),
    state = require("./state.js")(errors, map, toolbar),
    menu = require("multiuser-file-menu")(
	"maps",
	dataTransfer.serialize,
	dataTransfer.deserialize,
	state.get,
	state.set,
	state.fresh
    ),
    layerControl = require("./layer-control.js")(body, toolbar, state.getLayers, state.getTileLayers, map.zoomTo),
    paint = require("./paint.js")(
	map.overlay,
	map.projectTile,
	function() {
	    return state.getLayers().sortedByZ();
	}
    );

// TODO extra buttons
menu.buildMenu(body, []);

layers.onCreate(function(l) {
    // TODO thing
});

layers.onReorder(function(l) {
    paint.redrawAll();
});

map.onViewreset(paint.redrawAll);

var handlers = require("./file-handlers.js")(
    errors, 
    geometries, 
    state.getLayers, 
    paint.redrawAll
);
require("./file-drop.js")(d3.select("body"), errors, handlers);
