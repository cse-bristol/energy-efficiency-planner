"use strict";

/*global module, require*/

var dialogueFactory = require("floating-dialogue"),
    drawResultsTablesFactory = require("./draw-results-tables.js");


module.exports = function(container, getShapeLayers) {
    var resultsTables = dialogueFactory(
	"results",
	{
	    reposition: true,
	    close: true,
	    resize: true,
	    sticky: true,
	    bringToFront: true,
	    findSpace: true,
	    lockToScreen: true
	}
    ),

	drawResultsTables = drawResultsTablesFactory(getShapeLayers),
	
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
	
	headerClicked: drawResultsTables.headerClicked,
	rowClicked: drawResultsTables.rowClicked,
	rowHovered: drawResultsTables.rowHovered,
	
	selectTable: function(layerId) {
	    return container.select("#results-table-" + layerId)
		.select("table");
	},

	addEmphasis: drawResultsTables.addEmphasis,
	clearEmphasis: drawResultsTables.clearEmphasis
    };
};
