"use strict";

/*global module, require*/

var autosaveFactory = require("./autosave.js"),
    autoloadFactory = require("./autoload.js");

/*
 Connects up the autosave and autoload modules, and ensures that they don't tread on each-other's toes.
 */
module.exports = function(
    writeOp,
    onReadOp,
    state,
    data,
    toolbar
) {
    var
    reading = false,
    writing = false,
    
    autosave = autosaveFactory(
	function(op) {
	    if (!(state.loading() || reading)) {
		try {
		    writing = true;
		    writeOp(op);
		} finally {
		    writing = false;
		}
	    }
	    
	},
	state.onSet,
	state.getTileLayers,
	state.getLayers,
	state.getViewport,
	toolbar,
	data.serializeShapeLayer,
	data.serializeViewport
    ),
    
    autoload = autoloadFactory(
	state.getLayers, data.deserializeShapeSort, data.deserializeShapeLayer,
	state.getTileLayers,
	state.getViewport, data.deserializeViewport,
	toolbar.show, toolbar.hide
    );
    
    onReadOp(function(op) {
	if (!writing) {
	    try {
		reading = true;
		autoload.readOp(op);
	    } finally {
		reading = false;
	    }
	}
    });
};
