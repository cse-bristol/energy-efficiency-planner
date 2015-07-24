"use strict";

/*global module, require*/

var d3 = require("d3"),
    _ = require("lodash");

/*
 A collection of shape (GeoJSON vector) layers which will be drawn as map overlays.

 May be reordered to determine which layers will be drawn on top.
 */
module.exports = function(errors) {
    var layers = d3.map([]),
	order = [],
	verifyOrderChange = function() {
	    // Make sure this doesn't get out of sync.
	    order = _.uniq(
		_.compact(
		    order
		)
	    );
	};


    return {
	names : function() {
	    return layers.keys();
	},
	
	all: function() {
	    return layers.values();
	},

	ordered: function() {
	    return _.compact(
		order.map(
		    function(layerName) {
			return layers.get(layerName);
		    }
		)
	    );
	},
	
	get: function(name) {
	    return layers.get(name);
	},

	has: function(name) {
	    return layers.has(name);
	},

	add: function(layer) {
	    if (layers.has(layer.name())) {
		errors.informUser("Layer with name " + layer.name() + " already exists, and will be replaced.");
	    } else {
		order.push(layer.name());
		verifyOrderChange();
	    }
	    
	    layers.set(layer.name(), layer);
	},

	remove: function(layer) {
	    if (layers.has(layer.name())) {
		layers.remove(layer.name());

		order.splice(
		    order.indexOf(
			layer.name()),
		    1
		);
		verifyOrderChange();
	    }
	},

	setOrder: function(newOrder) {
	    order = newOrder;
	    verifyOrderChange();
	},

	getOrder: function() {
	    return order;
	},

	moveLayer: function(layerName, fromIndex, toIndex) {
	    if (order[fromIndex] !== layerName) {
		errors.warnUser("Reordering failed " + layerName);
		return;
		
	    } else {
		order.splice(fromIndex, 1);
		order.splice(toIndex, 0, layerName);
		verifyOrderChange();
	    }
	}
    };
};

