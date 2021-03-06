"use strict";

/*global module, require*/

var dialogueFactory = require("../floating-dialogue/floating-dialogue.js"),
    drawLegendsFactory = require("./draw-legend.js");

module.exports = function(container, getTileLayers, getShapeLayers, onSetState) {
    var options = {
	close: true,
	resize: true,
	reposition: true,
	sticky: true,
	findSpace: true,
	lockToScreen: true,
	initialVisibility: false
    },
	
	drawLegends = drawLegendsFactory(getTileLayers, getShapeLayers),

	drawButtonContent = function(buttons, newButtons) {
	    newButtons.text("7");
	},
	
	shapeDialogues = dialogueFactory(
	    "shape-legend",
	    options	    
	),

	shapeDrawing = shapeDialogues.drawing(
	    function(layerName) {
		return getShapeLayers().get(layerName).legend.dialogueState;
	    },
	    container,
	    drawLegends.shapes,
	    drawButtonContent,
	    function(layerName) {
		return getShapeLayers().get(layerName).legend.dialogueState;
	    }
	),

	tileDialogues = dialogueFactory(
	    "tile-legend",
	    options
	),

	tileDrawing = tileDialogues.drawing(
	    function(layerName) {
		return getTileLayers().overlays.get(layerName).legend.dialogueState;
	    },
	    container,
	    drawLegends.tiles,
	    drawButtonContent,
	    function(layerName) {
		return getTileLayers().overlays.get(layerName).legend.dialogueState;
	    }
	),

	update = function() {
	    shapeDrawing.dialogues(
		getShapeLayers().all()
		    .map(function(layer) {
			return layer.legend.dialogueState;
		    })
	    );

	    var tilesWithLegends = getTileLayers().overlays
		    .entries()
		    .filter(function(e) {
			return e.value.legend;
		    });

	    tilesWithLegends.forEach(function(e) {
		if (!e.value.legend.dialogueState) {
		    e.value.legend.dialogueState = tileDialogues.createData(e.key);
		}
	    });
	    
	    tileDrawing.dialogues(
		tilesWithLegends
		    .map(function(e) {
			return e.value.legend.dialogueState;
		    })
	    );
	},

	overlaysWithLegends = function(layerName, i) {
	    return getTileLayers().overlays.get(layerName).legend;
	};
        
    return {
	update: update,
	shapeButtons: shapeDrawing.buttons,
	tileButtons: function(parentSelection) {
	    tileDrawing.buttons(
		parentSelection.filter(function(layerName, i) {
		    return getTileLayers().overlays.get(layerName).legend;
		})
	    );
	},
	shapeCreate: shapeDialogues.createData,
	shapeDeserialize: shapeDialogues.deserialize,
	tileDeserialize: tileDialogues.deserialize
    };
};
