"use strict";

/*global module, require*/

var dialogueFactory = require("floating-dialogue"),
    drawResultsTablesFactory = require("./draw-results-tables.js");


module.exports = function(container, getShapeLayers) {
    var resultsTables = dialogueFactory(
	"results-table",
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
	    function(d, i) {
		return [d.resultsTable];
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
	headerClicked: drawResultsTables.headerClicked
    };
};
