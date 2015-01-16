"use strict";

/*global module, require*/

var d3 = require("d3"),
    _ = require("lodash"),
    helpers = require("../helpers.js"),
    callbacks = helpers.callbackHandler;

/*
 A collection of shape (GeoJSON vector) layers which will be drawn as map overlays.

 May be reordered to determine which layers will be drawn on top.
 */
module.exports = function(errors) {
    var layers = d3.map([]),
	order = [],
	onAdd = callbacks(),
	onRemove = callbacks(),
	onReorder = callbacks();


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
	
	get : function(name) {
	    return layers.get(name);
	},

	add: function(layer) {
	    if (layers.has(layer.name())) {
		errors.informUser("Layer with name " + layer.name() + " already exists, and will be replaced.");
	    } else {
		order.push(layer.name());
	    }
	    
	    layers.set(layer.name(), layer);
	    
	    onAdd(layer);
	},

	remove: function(layer) {
	    if (layers.has(layer.name())) {
		layers.remove(layer.name());

		order.splice(
		    order.indexOf(
			layer.name()),
		    1
		);
		
		onRemove(layer);
		onReorder();
	    }
	},

	setOrder: function(newOrder) {
	    order = newOrder;
	    onReorder();
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
		onReorder();
	    }
	},

	onAdd: onAdd.add,
	onRemove: onRemove.add,
	onReorder: onReorder.add
    };
};

