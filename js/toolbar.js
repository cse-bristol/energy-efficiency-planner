"use strict";

/*global module, require*/

var d3 = require("d3");

/*
 Holds an element which we will use to display a toolbar, along with providing a convenient way to look up the visibility status of the tools which belong in there.

 Each tool is a floating dialogue. The toolbar contains an icon which opens and closes them.
 */
module.exports = function(container) {
    var dialogueFactories = d3.map(),
	dialogueData = d3.map();

    var m = {
	add: function(toolText, dialogueFactory) {
	    dialogueFactories.set(toolText, dialogueFactory);
	    dialogueData.set(
		toolText,
		// We'll only have one of each kind of tool, so we can just re-use the typeId as the dialogue id.
		dialogueFactory.createData(dialogueFactory.typeId)
	    );
	},

	getData: function(toolText) {
	    return dialogueData.get(toolText);
	},

	eachData: function(f) {
	    dialogueData.forEach(f);
	},

	has: function(toolText) {
	    return dialogueData.has(toolText);
	},

	getState: function() {
	    var s = {};

	    dialogueData.forEach(function(toolText, data) {
		s[toolText] = data.serialize();
	    });

	    return s;
	},

	setState: function(state) {
	    Object.keys(state).forEach(function(toolText) {
		if (dialogueFactories.has(toolText)) {
		    dialogueData.set(
			toolText,
			dialogueFactories.get(toolText)
			    .loadData(state[toolText])
		    ); 
		}
	    });
	}
    };

    return m;
};
