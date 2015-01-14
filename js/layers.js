"use strict";

/*global module, require*/

var d3 = require("d3"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler,
    worksheetFactory = require("./table/worksheet.js")(),
    resultsTableFactory = require("./table/results-table.js"),
    idMaker = require("./id-maker.js");

/*
 A collection of shape (GeoJSON vector) layers which will be drawn as map overlays.

 These are designed to be mostly compatible with Leaflet's layers API.
 */
module.exports = function(errors) {
    var layers = d3.map([]),
	onCreate = callbacks(),
	onReorder = callbacks();

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
		var id = idMaker.fromString(shape.properties[nameProp]);

		while (ids.has(id) || id === "") {
		    /* Prevent duplicate names. */
		    id = idMaker.increment(id);
		}

		ids.add(id);
		shape.id = id;
	    });
	    errors.informUser("Using " + nameProp + " as id property.");

	} else {
	    var id = "";
	    geometry.forEach(function(shape){
		id = idMaker.increment(id);
		shape.id = id;
	    });
	    errors.informUser("No 'id' property found. Inventing names for each shape.");
	}
    };

    var enabled = function() {
	return layers.values().filter(function(l){
	    return l.enabled;
	});
    };
    
    return {
	enabled : enabled,
	sortedByZ: function() {
	    return enabled().slice(0).sort(function(a, b){
		return a.options.zIndex - b.options.zIndex;
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
		onReorder();
	    }
	},
	create : function(namePreference, geometry, boundingbox) {
	    var name = idMaker.fromString(namePreference),
		onSetOpacity = callbacks(),
		onSetZIndex = callbacks(),
		onRemove = callbacks(),
		anyPoints;

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
		
		/*
		 Does this layer container any Points. This is useful, because it means we can know whether we should present the user with the option to scale these based on data.
		 */
		anyPoints: function() {
		    if (anyPoints === undefined) {
			var checkGeom = function(o) {
			    if (o.type) {
				switch(o.type) {
				case "Point":
				case "MultiPoint":
				    anyPoints = true;
				    break;
				default:
				    // noop
				}
			    }

			    if (o.length) {
				o.forEach(function(x) {
				    checkGeom(x);
				});
			    }

			    if (o.features) {
				checkGeom(o.features);
			    }

			    if (o.geometries) {
				checkGeom(o.geometries);
			    }

			    if (o.geometry) {
				checkGeom(o.geometry);
			    }
			};

			checkGeom(geometry);
		    }

		    return anyPoints;
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
		    onSetOpacity(o);
		},
		
		setZIndex : function(z) {
		    l.options.zIndex = z;
		    onSetZIndex(z);
		},

		overlay : true,

		remove: function() {
		    if (layers.has(l.name())) {
			layers.remove(l.name());
			onRemove();
		    }
		},

		worksheet: worksheetFactory(geometry),
		resultsTable: resultsTableFactory(),

		onSetOpacity: onSetOpacity.add,
		onSetZIndex: onSetZIndex.add,
		onRemove: onRemove.add
	    };	    

	    geometry.forEach(function(g){
		g.layer = l;
		g.key = name + "/" + g.id;
	    });
	    
	    if (layers.has(l.name())) {
		errors.warnUser("Layer with name " + l.name() + " already exists, and will be replaced.");
	    }
	    
	    layers.set(l.name(), l);

	    onCreate(l);
	    
	    return l;
	},

	/*
	 callback is a function which will be called every time a new layer is created.
	 It will be passed the layer as an argument.
	 */
	onCreate: onCreate.add,

	onReorder: onReorder.add
    };
};

