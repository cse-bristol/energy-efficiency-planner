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
	tools = d3.map(),
	onVisibilityChanged = callbacks();

    return {
	add: function(toolText, dialogue) {
	    var icon = el.append("span").text(toolText);

	    dialogue.open(icon);
	    tools.set(toolText, dialogue);

	    dialogue.onVisibilityChanged(function(visibility) {
		onVisibilityChanged(toolText, visibility);
	    });
	},

	visibility: function() {
	    var r = {};

	    tools.forEach(function(key, value) {
		r[key] = value.visible();
	    });

	    return r;
	},

	onVisibilityChanged: onVisibilityChanged.add,

	show: function(toolText) {
	    if (tools.has(toolText)) {
		tools.get(toolText).show();
	    } else {
		throw new Error("Unknown tool " + toolText);
	    }
	},

	hide: function(toolText) {
	    if (tools.has(toolText)) {
		tools.get(toolText).hide();
	    } else {
		throw new Error("Unknown tool " + toolText);
	    }
	}
    };
};
