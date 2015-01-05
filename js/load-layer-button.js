"use strict";

/*global module, require*/

var helpers = require("./helpers.js"),
    noop = helpers.noop;

module.exports = function(collection, getLayers, load, makeButton) {
    return makeButton(
	"Layers",
	function(name) {
	    load(
		getLayers(),
		name,
		noop
	    );
	},
	{
	    onlineOffline: {
		online: true,
		offline: false
	    },
	    
	    search: {
		collection: collection    
	    }
	}
    );
};
