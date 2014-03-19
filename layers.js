"use strict";

/*global d3, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.layers = function(errors) {
    var layers = d3.map([]);
    var callbacks = [];
    
    return {
	all : function() {
	    return layers.values();
	},
	names : function() {
	    return layers.keys();
	},
	get : function(name) {
	    return layers.get(name);
	},
	create : function(name, geometry) {
	    var sources = [];
	    sources.push(OpenDataMap.source.fromGeometry(geometry, name + ": geometry"));
	    
	    var l = {

		name : function() {
		    return name;
		},

		geometry : function(hapes) {
		    return geometry;
		},

		addSource : function(s) {
		    sources.push(s);
		},

		sources : function() {
		    return sources;
		},

		/*
		 Returns whether or not this layer has finished loading its geometry.
		 */
		loaded : function() {
		    return !!geometry;
		}
	    };

	    if (layers.has(l.name())) {
		errors.warnUser("Layer with name " + l.name() + " already exists, and will be replaced.");
	    }
	    
	    layers.set(l.name(), l);

	    callbacks.forEach(function(c){
		c(l);
	    });
	    
	    return l;
	},
	/*
	 callback is a function which will be called every time a new layer is created.
	 It will be passed the layer as an argument.
	 */
	layerCreated : function(callback) {
	    callbacks.push(callback);
	}
    };
};

