"use strict";

/*global module, require*/

var helpers = require("../../helpers.js"),
    noop = helpers.noop;

module.exports = function(collection, shapeLayerFactory, getShapeLayers, load, makeButton) {
    return makeButton(
	"Layers",
	function(name) {
	    load(
		name,
		function(geometry, bbox) {
		    getShapeLayers().add(
			shapeLayerFactory(name, geometry, bbox)
		    );
		}
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
