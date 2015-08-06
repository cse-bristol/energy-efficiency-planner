"use strict";

/*global module, require*/

var d3 = require("d3"),
   
    slideOutFactory = require("./slide-out.js");

module.exports = function(topPane, bottomPane, onSetState) {
    var slideOut = slideOutFactory(
	topPane,
	bottomPane,
	"errors-control",
	"!",
	false
    );
    
    return {
	save: function() {
	    return {
		visible: slideOut.getVisibility()
	    };
	},

	load: function(state) {
	    if (state && state.visible !== undefined) {
		slideOut.setVisibility(state.visible);
	    } else {
		slideOut.reset();
	    }
	},

	attach: function(map) {
	    slideOut.attach(map);
	},

	open: function() {
	    slideOut.setVisibility(true);
	},

	getContainer: function() {
	    return bottomPane;
	}
    };
};
