"use strict";

/*global module, require*/

var dialogueFactory = require("floating-dialogue"),
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
	    newButtons.text("K");
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
	    
	    tileDrawing.dialogues(
		getTileLayers().overlays
		    .entries()
		    .filter(function(e) {
			return e.value.legend;
		    })
		    .map(function(e) {
			return e.value.legend.dialogueState;
		    })
	    );
	},

	overlaysWithLegends = function(layerName, i) {
	    return getTileLayers().overlays.get(layerName).legend;
	};

    onSetState(function() {
	getTileLayers()
	.overlays
	.forEach(function(name, layer) {
	    if (layer.legend && !layer.legend.dialogueState) {
		layer.legend.dialogueState = tileDialogues.createData(name);
	    }
	});
    });
        
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
