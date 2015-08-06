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
	sidePanel.update(state);	
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
    geocoder = require("./geocoder.js")(map),

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

    menuModule = require("multiuser-file-menu")(
    	"maps",
	"map",
    	serialize,
    	deserialize,
    	state.get,
    	state.set,
    	state.fresh,
	null,
	"http://tools.smartsteep.eu/wiki/User_Manual#Using_the_mapping_tool"
    ),

    shapeLayerSerialization = require("./serialization/serialize-shape-layer.js")(
	shapeLayerFactory,
	resultsTables.deserialize,
	legend.shapeDeserialize,
	update
    ),
    
    fetchLayers = require("./state/shape-layers/fetch-layers.js")(
	menuModule.backend.load,
	menuModule.backend.loadSnapshot,
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
	menuModule.backend.search,
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
	menuModule.spec.button,
	update
    ),

    fileMenu = menuModule.buildMenu(leftPane);

geocoder.insertInContainer(fileMenu);

sidePanel.attach(map);
map.addControl(
    leaflet.control.zoom({
	position: "topright"
    })
).addControl(leaflet.control.zoomBox({
    position: "topright"
}));
bottomPanel.attach(map);

fileMenu.standardButtons.disable(
    fileMenu.standardButtons.autosaveButton
);

fileMenu.standardButtons.insertBefore(
    viewportButtons.set,
    fileMenu.standardButtons.historyButton
);

fileMenu.setButtons(fileMenu.standardButtons.ordered);

menuModule.queryString.fromURL();
