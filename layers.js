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

    var incrementName = function(n) {
	var accum = function(n, acc) {
	    if (n.length === 0) {
		return acc + "A";
	    } 

	    var len = n.length;
	    var head = n.slice(0, len - 1);
	    var tail = n[len - 1];

	    if (tail === "Z") {
		return accum(head, "A" + acc);
	    } else {
		var codeNow = tail.charCodeAt(0);
		var replacement = String.fromCharCode(codeNow + 1);
		return head + replacement + acc;
	    }
	};

	return accum(n, "");
    };

    var fixGeometryNames = function(geometry) {
	var chooseNameProp = function (keys) {
	    var nameProperties = [
		"id",
		"name",
		"nome",
		"nombre"
	    ];
	    
	    var candidates = keys.filter(function(k){
		return !nameProperties.every(function(p){
		    return k.toLowerCase() !== p;
		});
	    });
	    if (candidates.length > 0) {
		return candidates[0];
	    }

	    candidates = keys.filter(function(k){
		return !nameProperties.every(function(p){
		    return k.toLowerCase().indexOf(p) < 0;
		});
	    });

	    if (candidates.length > 0) {
		return candidates[0];
	    }

	    return null;
	};

	if (geometry.length === 0) {
	    errors.warnUser("Tried to Import a geometry layer which contained no shapes.");
	    return;
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
	    var ids = d3.set({});
	    
	    geometry.forEach(function(shape){
		var id = shape.properties[nameProp];

		while (ids.has(id)) {
		    /* Prevent duplicate names. */
		    id = incrementName(id);
		}

		ids.add(id);
		shape.id = id;
	    });
	    errors.informUser("Using " + nameProp + " as id property.");

	} else {
	    var id = "A";
	    geometry.forEach(function(shape){
		shape.id = id;
		id = incrementName(id);
	    });
	    errors.informUser("No 'id' property found. Inventing names for each shape.");
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

	    var l = {
		name : function() {
		    return name;
		},

 		boundingbox : function() {
		    return boundingbox;
		},

		geometry : function() {
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

	    geometry.forEach(function(g){
		g.layer = l;
		g.key = name + "/" + g.id;
	    });
	    
	    layerSources.push(sources.fromGeometry(geometry, name + ": geometry"));

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

