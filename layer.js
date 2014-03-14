"use strict";

/*global d3, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 Represents a named set of geometry objects, along with some properties which describe those objects.
*/
OpenDataMap.layer = function(name) {
    var geometry = null;
    var callbacks = [];

    var module = {
	name : function() {
	    return name;
	},

	/*
	 If shapes is passed, set the geometry to shapes, then return it. onGeometryLoaded callbacks will also be triggered at this point.
	 Otherwise, just return the geometry if it is present.
	 */
	geometry : function(shapes) {
	    if (shapes){
		geometry = shapes;
		callbacks.forEach(function(c){
		    c(geometry);
		});

		return geometry;
	    } else if (geometry) {
		return geometry;
	    } else {
		return {};
	    }
	},

	/*
	 Registers a callback which will happen when this layer has its geometry set.
	 If the geometry has already loaded, calls the callback immediately.

	 callback is a function taking one argument which is the geometry.
	 */
	onGeometryLoaded : function(callback)  {
	    if (geometry) {
		callback(geometry);
	    } else {
		callbacks.push(callback);
	    }
	},

	/*
	 Returns whether or not this layer has finished loading its geometry.
	 */
	loaded : function() {
	    return !!geometry;
	}
    };

    return module;
};
