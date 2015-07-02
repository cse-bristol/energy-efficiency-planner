"use strict";

/*global module, require*/

var d3 = require("d3"),
    idMaker = require("../../id-maker.js");

module.exports = function(errors) {
    return function(geometry) {
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
};
