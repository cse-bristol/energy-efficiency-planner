"use strict";

/*global module, require*/

var dialogueFactory = require("../floating-dialogue/floating-dialogue.js"),
    drawResultsTablesFactory = require("./draw-results-tables.js");


module.exports = function(container, getShapeLayers, update) {
    var resultsTables = dialogueFactory(
	"results",
	{
	    reposition: true,
	    close: true,
	    resize: true,
	    sticky: true,
	    bringToFront: true,
	    findSpace: true,
	    lockToScreen: true,
	    initialVisibility: false
	}
    ),

	drawResultsTables = drawResultsTablesFactory(getShapeLayers, update),
	
	drawing = resultsTables.drawing(
	    function(id) {
		return getShapeLayers().get(id).resultsTable;
	    },
	    container,
	    drawResultsTables.drawDialogues,
	    function(buttons, newButtons) {
		newButtons.text("⊞");
	    },
	    function(layerName) {
		return getShapeLayers().get(layerName).resultsTable;
	    }
	);

    return {
	createData: resultsTables.createData,
	deserialize: resultsTables.deserialize,
	updateDialogues: function(orderedShapeLayers) {
	    drawing.dialogues(
		orderedShapeLayers.map(function(shapeLayer) {
		    return shapeLayer.resultsTable;
		})
	    );
	},
	updateButtons: drawing.buttons,
	
	rowClicked: drawResultsTables.rowClicked,
	rowHovered: drawResultsTables.rowHovered,
	
	selectTableRow: function(layerId, shapeId) {
	    return container.select("#" + drawResultsTables.rowId(layerId, shapeId));
	},

	addEmphasis: drawResultsTables.addEmphasis,
	clearEmphasis: drawResultsTables.clearEmphasis
    };
};
