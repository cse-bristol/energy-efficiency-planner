"use strict";

/*global d3, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.layers = function(errors, sources) {
    var layers = d3.map([]);
    var createCallbacks = [];
    var changeCallbacks = [];

    var layerChanged = function(l) {
	changeCallbacks.forEach(function(c){
	    c(l);
	});
    };

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
	enabled : function() {
	    return layers.values().filter(function(l){
		return l.enabled;
	    });
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

		enabled : true,

		/* 
		 Functions below here are for compatibility with leaflet.js layers.
		 */
		options : {
		    zIndex : 0,
		    opacity : 0.9
		},
		
		setOpacity : function(o) {
		    l.options.opacity = o;
		    layerChanged(l);
		},
		
		setZIndex : function(z) {
		    l.options.zIndex = z;
		    layerChanged(l);
		},

		onAdd : function() {
		    l.enabled = true;
		    layerChanged(l);
		},

		onRemove : function() {
		    l.enabled = false;
		    layerChanged(l);
		},

		overlay : true	
	    };

	    if (layers.has(l.name())) {
		errors.warnUser("Layer with name " + l.name() + " already exists, and will be replaced.");
	    }
	    
	    layers.set(l.name(), l);

	    createCallbacks.forEach(function(c){
		c(l);
	    });
	    
	    return l;
	},
	/*
	 callback is a function which will be called every time a new layer is created.
	 It will be passed the layer as an argument.
	 */
	layerCreated : function(callback) {
	    createCallbacks.push(callback);
	},

	/*
	 Callbacks passed here will be called with a layer every time some aspect of its physical display changes (opacity, z-index, enabled).
	 */
	layerChanged : function(callback) {
	    changeCallbacks.push(callback);
	}
    };
};

