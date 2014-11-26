"use strict";

/*global module, require*/

var helpers = require("./helpers.js"),
    noop = helpers.noop;

module.exports = function(collection, getLayers, load) {
    return {
	text: "Layers",
	f: function(name) {
	    load(
		getLayers(),
		name,
		noop
	    );
	},
	
	onlineOnly: true,

	search: {
	    collection: collection    
	}
    };
};
