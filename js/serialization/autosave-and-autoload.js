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

    canWrite = function() {
	return !(state.loading() || data.reading() || reading);
    },
    
    autosave = autosaveFactory(
	function(op) {
	    if (canWrite()) {
		try {
		    writing = true;
		    writeOp(op);
		} finally {
		    writing = false;
		}
	    }
	    
	},
	canWrite,
	state.onSet,
	state.getTileLayers,
	state.getShapeLayers,
	state.getViewport,
	data.serializeShapeLayer,
	data.serializeViewport
    ),
    
    autoload = autoloadFactory(
	state.set, data.deserialize,
	state.getShapeLayers, data.deserializeShapeSort, data.deserializeShapeLayer,
	state.getTileLayers,
	state.getViewport, data.deserializeViewport
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
