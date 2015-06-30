"use strict";

/*global module, require*/

var drawShapeLayersFactory = require("./draw-shape-layers.js"),
    layerControlFactory = require("./layer-control/draw-layer-control.js");

module.exports = function(container, resultsTables, getTileLayers, getShapeLayers, map) {
    var hovered = {
	layerId: null,
	shapeId: null
    },
	getHoveredShape = function() {
	    return hovered;
	},
	
	setHoveredShape = function(layerId, shapeId) {
	    if (layerId === hovered.layerId && shapeId === hovered.shapeId) {
		return;
	    }

	    var oldShape = drawShapeLayers.selectShapeAndLayer(
		hovered.layerId,
		hovered.shapeId
	    ),
		oldTable = drawResultsTables.selectTable(
		    hovered.layerId
		),

		newShape = drawShapeLayers.selectShapeAndLayer(
		    layerId, shapeId
		),
		newTable = drawResultsTables.selectTable(
		    layerId
		);
	    
	    hovered.layerId = layerId;
	    hovered.shapeId = shapeId;
	    
	    drawShapeLayers.updateEmphasis(oldShape);
	    drawResultsTables.updateEmphasis(oldTable);
	    drawShapeLayers.updateEmphasis(newShape);
	    drawResultsTables.updateEmphasis(newTable);
	},

	
	updateShapeLayer = function() {
	    // ToDo
	    // decide if this takes a selection or an id
	    // update layer control for that shape?
	    // layer control is responsible for updating tables, legends, opacity sliders
	    // redraw the shapes themselves
	},
	
	updateAll = function() {
	    var orderedShapeLayers = getShapeLayers().ordered().reverse();
	    layerControl.update(getTileLayers(), orderedShapeLayers);
	    drawLegends(getTileLayers(), orderedShapeLayers);
	    drawResultsTables.draw(orderedShapeLayers);
	    toolbar.update();
	    drawShapeLayers.fromData(orderedShapeLayers);
	},

	drawShapeLayers = drawShapeLayersFactory(
	    map.overlay,
	    map.projectTile,
	    getHoveredShape,
	    setHoveredShape,
	    getShapeLayers,
	    updateShapeLayer
	),
    
	drawResultsTables = resultsTables.drawing(
	    function(id) {
		return getShapeLayers().get(id);
	    },
	    container,
	    drawDialogueContent,
	    drawButtonContent,
	    function(d, i) {
		return [d.resultsTable];
	    }
	),

	layerControl = layerControlFactory(
	    container,
	    toolbar,
	    getShapeLayers,
	    getTileLayers,
	    map.zoomTo
	);

    return {
	update: updateAll
    };
};
