"use strict";

/*global module, require*/

var drawShapeLayersFactory = require("./draw-shape-layers.js");

module.exports = function(container, resultsTables, updateLegends, updateLayerControl, getTileLayers, getShapeLayers, map) {
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
		oldTable = resultsTables.selectTable(
		    hovered.layerId
		),

		newShape = drawShapeLayers.selectShapeAndLayer(
		    layerId, shapeId
		),
		newTable = resultsTables.selectTable(
		    layerId
		);
	    
	    hovered.layerId = layerId;
	    hovered.shapeId = shapeId;
	    
	    drawShapeLayers.clearEmphasis(oldShape);
	    resultsTables.clearEmphasis(oldTable);
	    drawShapeLayers.addEmphasis(newShape, hovered.shapeId);
	    resultsTables.addEmphasis(newTable, hovered.shapeId);
	},

	updateShapeLayer = function(layerId) {
	    // ToDo
	    updateAll();	    
	},

	updateAll = function() {
	    var orderedShapeLayers = getShapeLayers().ordered().reverse();

	    resultsTables.updateDialogues(orderedShapeLayers);
	    drawShapeLayers.fromData(orderedShapeLayers);

	    updateLegends();
	    updateLayerControl();
	},

	drawShapeLayers = drawShapeLayersFactory(
	    map.overlay,
	    map.projectTile,
	    getHoveredShape,
	    setHoveredShape,
	    getShapeLayers
	);

    resultsTables.headerClicked(updateShapeLayer);
    
    return {
	update: updateAll
    };
};
