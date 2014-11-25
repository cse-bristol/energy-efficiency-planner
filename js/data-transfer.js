"use strict";

/*global module, require*/

/*
 Converts between the state of the world (as defined in model.js) and data transfer objects which can be turned into JSON and sent out across the wire.
 */
module.exports = function(errors) {
    return {
	serialize: function() {
	    throw new Error("Not implemented");
	},

	deserialize: function() {
	    throw new Error("Not implemented");
	}
    };
};
