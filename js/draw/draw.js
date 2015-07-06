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

	    var oldShape = drawShapeLayers.selectShape(
		hovered.layerId,
		hovered.shapeId
	    ),
		oldRow = resultsTables.selectTableRow(
		    hovered.layerId,
		    hovered.shapeId
		),

		newShape = drawShapeLayers.selectShape(
		    layerId, shapeId
		),
		newRow = resultsTables.selectTableRow(
		    layerId,
		    shapeId
		);
	    
	    hovered.layerId = layerId;
	    hovered.shapeId = shapeId;

	    drawShapeLayers.clearEmphasis(oldShape);
	    resultsTables.clearEmphasis(oldRow);
	    drawShapeLayers.addEmphasis(newShape);
	    resultsTables.addEmphasis(newRow);
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

	    if (hovered.shapeId !== null) {
		drawShapeLayers.addEmphasis(
		    drawShapeLayers.selectShape(hovered.layerId, hovered.shapeId)
		);
	    }
	},

	drawShapeLayers = drawShapeLayersFactory(
	    map.overlay,
	    map.projectTile,
	    setHoveredShape,
	    getShapeLayers
	);

    resultsTables.headerClicked(updateShapeLayer);
    resultsTables.rowClicked(function(shapeGeometry) {
	map.zoomTo(shapeGeometry.bbox);
    });
    resultsTables.rowHovered(setHoveredShape);

    map.onViewReset(updateAll);
    
    return {
	update: updateAll
    };
};
