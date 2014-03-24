"use strict";

/*global d3, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.layers = function(errors, sources) {
    var layers = d3.map([]);
    var callbacks = [];

    var fixGeometryNames = function(geometry) {
	var chooseNameProp = function (keys) {
	    var candidates = keys.filter(function(k){
		if (k.toLowerCase() === "name") {
		    return true;
		} else if (k.toLowerCase() === "id") {
		    return true;
		} else {
		    return false;
		}
	    });
	    if (candidates.length > 0) {
		return candidates[0];
	    }

	    candidates = keys.filter(function(k){
		if (k.toLowerCase().indexOf("name") >= 0) {
		    return true;
		} else if (k.toLowerCase().indexOf("id") >= 0) {
		    return true;
		} else {
		    return false;
		}
	    });

	    if (candidates.length > 0) {
		return candidates[0];
	    }

	    return null;
	};

	if (geometry.every(function(shape){
	    return shape.properties.Name;
	})
	    || geometry.length === 0) {
	    return; // No fix required.
	}

	var candidates = Object.keys(geometry[0].properties);
	geometry.forEach(function(shape){
	    var keys = Object.keys(shape.properties);
	    candidates = candidates.filter(function(c){
		return keys.indexOf(c) >= 0;
	    });
	});
	
	var nameProp = chooseNameProp(candidates);

	if (nameProp) {
	    geometry.forEach(function(shape){
		shape.properties.Name = shape.properties[nameProp];
	    });
	    errors.informUser("No 'Name' property found. Using " + nameProp + " instead.");

	} else {
	    throw "Could not import layer because it did not have a suitable name or id property.";
	}
    };
    
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
	create : function(name, geometry, boundingbox) {
	    var layerSources = [];
	    fixGeometryNames(geometry);
	    
	    layerSources.push(sources.fromGeometry(geometry, name + ": geometry"));
	    
	    var l = {

		name : function() {
		    return name;
		},

		boundingbox : function() {
		    return boundingbox;
		},

		geometry : function(hapes) {
		    return geometry;
		},

		addSource : function(s) {
		    layerSources.push(s);
		},

		sources : function() {
		    return layerSources;
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

