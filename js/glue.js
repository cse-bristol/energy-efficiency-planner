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
	paint.onClickShape,
	paint.onHoverShape,
	paint.redrawAll
    ),    
    state = require("./state.js")(errors, map, toolbar, tableForLayer, paint.redrawAll),
    dataTransfer = require("./data-transfer.js")(errors, state.fresh),
    menu = require("multiuser-file-menu")(
	"maps",
	dataTransfer.serialize,
	dataTransfer.deserialize,
	state.get,
	state.set,
	state.fresh
    ),
    layerControl = require("./layer-control.js")(body, toolbar, state.getLayers, state.getTileLayers, map.zoomTo);

// TODO extra buttons
menu.buildMenu(body, []);

map.onViewReset(paint.redrawAll);

var handlers = require("./file-handlers.js")(
    errors, 
    geometries, 
    state.getLayers, 
    paint.redrawAll
);
require("./file-drop.js")(d3.select("body"), errors, handlers);
