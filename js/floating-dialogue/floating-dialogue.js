"use strict";

/*global module, require*/

var d3 = require("d3"),
    createData = require("./data.js"),
    drawDialoguesFactory = require("./draw-dialogues.js"),
    drawButtonsFactory = require("./draw-buttons.js"),

    empty = d3.select();

/*
 Call this function to specify the kind of dialogue you want to create.

 typeId is a string that uniquely identifies this class of dialogues.

 options is an object which may contain the following properties:
 + reposition (boolean) adds drag-to-move
 + close (boolean) adds a hide 'X' button to the dialogue
 + resize (boolean) adds a resize handle to the diaogue
 + bringToFront (boolean) adds a 'TOP' button to the dialogue
 + sticky (boolean) adds stickyness/snapping/docking behaviour towards other dialogues when being moved or resized
 + findSpace (boolean) causes new dialogues to attempt to find a free space which do not overlap another dialogues (unless they have a specific manual position already)
 + lockToScreen (boolean) locks the dialogue to fit inside the browser window when moving or resizing
 + initialVisibility (boolean) determines whether or not the dialogue is visible by default.
 */
module.exports = function(typeId, options) {
    var dataFactory = createData(options);
    
    return {
	typeId: typeId,
	
	/*
	 Create the underlying data for 1 dialogue of this type.
	 */
	createData: dataFactory.create,

	deserialize: dataFactory.load,

	/*
	 Get the data for 1 dialogue of this type from serialized form.
	 */
	single: function() {
	    var state = dataFactory.create(),
		loaded = null;
	    
	    return {
		load: function(data) {
		    state = dataFactory.load(data);
		    if (loaded) {
			loaded();
		    }
		},

		save: function() {
		    return state.serialize();
		},

		reset: function() {
		    state = dataFactory.create();
		    if (loaded) {
			loaded();
		    }
		},

		getState: function() {
		    return state;
		},

		drawing: function(dialogueContainer, drawDialogueContent, buttonContainer, drawButtonContent) {
		    var getDataById = function() {
			return state;
		    },
			update = function() {
			    drawDialogues.fromData([state]);
			    if (drawButtons) {
			    	drawButtons.fromParentSelection(buttonContainer);
			    }
			},
			
			drawDialogues = drawDialoguesFactory(dialogueContainer, getDataById, update, typeId, options, drawDialogueContent),
			drawButtons = buttonContainer ? drawButtonsFactory(getDataById, update, typeId, drawButtonContent, getDataById) : null;

		    loaded = update;
		    
		    return {
			update: update
		    };
		}
	    };
	},

	/*
	 Call this when you want to draw multiple dialogues of the same kind based on some data.

	 getDataById is a way to lookup the most up-to-data date for a dialogue. This is used when we want to modify that data.

	 dialogueContainer is the object the dialogues will be drawn inside.

	 drawDialogueContent is a function which will get passed (dialogueSelection, newDialogueSelection).

	 [drawButtonContent] is an optional function which will get passed (buttonSelection, newButtonSelection).

	 [getDataFromParent] is a function which must be present if drawButtonContent is, and will be ignored otherwise. When we call buttons(parentSelection), this tells us how to get our dialogue data out of that selection's data.
	 */
	drawing: function(getDataById, dialogueContainer, drawDialogueContent, drawButtonContent, getDataFromParent) {
	    /*
	    Redraw a single dialogue and its associated button if appropriate.
	     */
	    var redrawOne = function(data) {
		var dialogue = dialogueContainer
			.select("#" + drawDialogues.id(data))
			.datum(data);
				
		drawDialogues.fromSelection(dialogue, empty);

		if (drawButtons) {
		    var button = d3
			    .select("#" + drawButtons.id(data))
			    .datum(data);
		    
		    drawButtons.fromSelection(button, empty);
		}
	    },

		drawDialogues = drawDialoguesFactory(dialogueContainer, getDataById, redrawOne, typeId, options, drawDialogueContent),
		drawButtons = drawButtonContent ? drawButtonsFactory(getDataById, redrawOne, typeId, drawButtonContent, getDataFromParent) : null;

	    return {
		/*
		 Takes an array of dialogue data.
		 */
		dialogues: drawDialogues.fromData,
		
		/*
		 Takes (parentSelection), extracts the dialogue state using getDataFromParent, then appends some buttons to the parentSelection as necessary.
		 */
		buttons: drawButtons ? drawButtons.fromParentSelection: null
	    };
	}
    };
};
    
