"use strict";

/*global module, require*/

var d3 = require("d3"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler;

/*
 Holds an element which we will use to display a toolbar, along with providing a convenient way to look up the visibility status of the tools which belong in there.

 Each tool is a floating dialogue. The toolbar contains an icon which opens and closes them.
 */
module.exports = function(container) {
    var el = container.append("div").attr("id", "toolbar"),
	tools = d3.map();

    return {
	add: function(toolText, dialogue) {
	    var icon = el.append("span").text(toolText);

	    dialogue.open(icon);
	    tools.set(toolText, dialogue);
	},

	get: function(toolText) {
	    return tools.get(toolText);
	},

	forEach: function(action) {
	    tools.forEach(action);
	},

	has: function(toolText) {
	    return tools.has(toolText);
	},

	/*
	 getState and setState convert to and from a snapshot of the tools' current positions, sizes and visibilities.

	 Normally we wouldn't have state and presentation mixed up in one class, but in this case it's helpful as it allows us to persist the position of the tools between clicks of the 'new' button.
	 */
	getState: function() {
	    var s = {};

	    tools.forEach(function(toolText, dialogue) {
		var toolState = {
		    visible: dialogue.visible()
		};

		if (dialogue.manuallySized) {
		    toolState.size = dialogue.size();
		}

		if (dialogue.manuallyPositioned) {
		    toolState.position = dialogue.position();
		}
		
		s[toolText] = toolState;
	    });

	    return s;
	},

	setState: function(state) {
	    Object.keys(state).forEach(function(toolText) {
		if (tools.has(toolText)) {
		    var toolState = state[toolText],
			dialogue = tools.get(toolText);

		    if (toolState.visible!== undefined) {
			if (toolState.visible) {
			    dialogue.show();
			} else {
			    dialogue.hide();
			}
		    }

		    if (toolState.size !== undefined) {
			dialogue.size(toolState.size);
		    }

		    if (toolState.position !== undefined) {
			dialogue.position(toolState.position);
		    }
		}
	    });
	}
    };
};
