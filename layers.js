"use strict";

/*global module, require*/

var d3 = require("d3"),
    callbackHandler = require("./helpers.js").callbackHandler;

module.exports = function(errors) {
    var layers = d3.map([]);
    var createCallbacks = callbackHandler();
    var changeCallbacks = callbackHandler();
    var removeCallbacks = callbackHandler();

    var stripRegex = new RegExp(" ", "g");
    var stripSpaces = function(s) {
	return s.replace(stripRegex, "_");
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
		var id = stripSpaces(shape.properties[nameProp]);

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
	all: function() {
	    return layers.values();
	},
	get : function(name) {
	    return layers.get(name);
	},

	reorder: function(layersAndDisplacements) {
	    if (layersAndDisplacements.length > 0) {
		layersAndDisplacements.forEach(function(layerWithDisplacement) {
		    layers.get(layerWithDisplacement[0])
			.options.zIndex += layerWithDisplacement[1];
		});
		changeCallbacks();
	    }
	},
	create : function(namePreference, geometry, boundingbox) {
	    var name = stripSpaces(namePreference);

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

		enabled : true,

		/* 
		 Functions below here are for compatibility with leaflet.js layers.
		 */
		options : {
		    // Layers added later go on top.
		    zIndex : layers.size() + 1,
		    opacity : 0.9
		},
		
		setOpacity : function(o) {
		    l.options.opacity = o;
		    changeCallbacks(l);
		},
		
		setZIndex : function(z) {
		    l.options.zIndex = z;
		    changeCallbacks(l);
		},

		onAdd : function() {
		    l.enabled = true;
		    changeCallbacks(l);
		},

		onRemove : function() {
		    l.enabled = false;
		    changeCallbacks(l);
		},

		overlay : true	
	    };	    

	    geometry.forEach(function(g){
		g.layer = l;
		g.key = name + "/" + g.id;
	    });
	    
	    if (layers.has(l.name())) {
		errors.warnUser("Layer with name " + l.name() + " already exists, and will be replaced.");
	    }
	    
	    layers.set(l.name(), l);

	    createCallbacks(l);
	    
	    return l;
	},

	remove : function(layer) {
	    if(layer && layer.name && layers.has(layer.name())) {
		layers.remove(layer.name());

		removeCallbacks(layer);
	    }
	},

	/*
	 callback is a function which will be called every time a new layer is created.
	 It will be passed the layer as an argument.
	 */
	layerCreated: createCallbacks.add,

	/*
	 Callbacks passed here will be called with a layer every time some aspect of its physical display changes (opacity, z-index, enabled).
	 */
	layerChanged: changeCallbacks.add,

	layerRemoved: removeCallbacks.add
    };
};

