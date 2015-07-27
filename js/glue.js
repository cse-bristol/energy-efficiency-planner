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
    topPane = body.append("div")
	.attr("id", "top-pane"),
    bottomPane = body.append("div")
	.attr("id", "bottom-pane"),
    
    leftPane = topPane.append("div")
	.attr("id", "top-left-pane"),
    rightPane = topPane.append("div")
	.attr("id", "top-right-pane"),
    
    update = function() {
	draw.update();
	map.update(state.getTileLayers().overlays.values());
    },

    serialize = function() {
	return serialization.serialize.apply(this, arguments);
    },

    deserialize = function() {
	return serialization.deserialize.apply(this, arguments);
    },
    
    progress = require("./progress.js")(body),

    map = require("./map.js")(leftPane),

    bottomPanel = require("./panels/bottom-panel.js")(
	topPane,
	bottomPane
    ),

    errors = require("./errors.js")(bottomPanel),

    sidePanel = require("./panels/side-panel.js")(
	leftPane,
	rightPane,
	errors
    ),
   
    state = require("./state/state.js")(
	errors,
	map,
	sidePanel,
	bottomPanel,
	update
    ),

    legend = require("./legend/legend.js")(body, state.getTileLayers, state.getShapeLayers, state.onSet),

    resultsTables = require("./results-tables/results-tables.js")(body, state.getShapeLayers, update),

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
	body,
	sidePanel.upload(),
	sidePanel.focusUpload,
	state,
	shapeLayerFactory,
	fetchLayers.save,
	errors,
	progress,
	update
    ),    

    layerControl = require("./layer-control/layer-control.js")(
	sidePanel.all(),
	sidePanel.active(),
	sidePanel.base(),
	legend.tileButtons,
	legend.shapeButtons,
	resultsTables.updateButtons,
	state.getTileLayers,
	state.getShapeLayers,
	fetchLayers,
	shapeLayerFactory,
	state.onSet,
	map.zoomTo,
	menu.backend.search,
	errors,
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

    serialization = require("./serialization/serialize.js")(
	shapeLayerSerialization.serialize,
	shapeLayerSerialization.deserialize,
	legend.tileDeserialize,
	sidePanel,
	bottomPanel,
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

sidePanel.attach(map);
map.addControl(
    leaflet.control.zoom({
	position: "topright"
    })
).addControl(leaflet.control.zoomBox({
    position: "topright"
}));
bottomPanel.attach(map);

menu.buildMenu(
    leftPane,
    standardButtonsWithoutAuto.concat([
	viewportButtons.set,
	viewportButtons.get
    ]),
    true
);

menu.queryString.fromURL();
