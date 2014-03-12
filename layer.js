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

    var headers = ["Name"];
    var data = d3.map({});

    var getOrCreateProperty = function(prop) {
	if (!data.has(prop)) {
	    data.set(prop, d3.map({}));
	    headers.push(prop);
	}

	return data.get(prop);
    };

    var addGeometryProperties = function(props) {
	var name = props.get("Name");
	props.entries().forEach(function(e){
	    getOrCreateProperty(e.key).set(name, OpenDataMap.timeLookup(d3.map({0 : e.value})));
	});
    };

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

		shapes.forEach(function(s){
		    addGeometryProperties(d3.map(s.properties));
		    
		    // {Name : thing, etc.}
		});

		return geometry;
	    } else if (geometry) {
		return geometry;
	    } else {
		return {};
	    }
	},

	/*
	 Returns the names of the properties available on this layer in the order in which they were added.
	 */
	propertyNames : function() {
	    return headers;
	},

	/*
	 Returns a 2D matrix of the property values for the named geometry objects in this layer.
	 The order of the rows will be the same as the order of the passed in names.
	 The order of the columns will be the same as the order of the propertyNames function.
	 */
	propertiesMatrix : function(time, names) {
	    return names.map(function(n){
		return headers.map(function(p){
		    if (data.has(p)) {
			var prop = data.get(p);
			if (prop.has(n)) {
			    return prop.get(n).lookup(time);
			}
			    
		    }
		    return "";
		});
	    });
	},

	/*
	 Adds a property to this layer.
	 prop is the name of the property
	 rows is a list of maps, where each map contains a name of an object and years to values, e.g. [{"Name" : "my-geometry-object", 2013 : 1, 2014 : 2}]
	 */
	addProperty : function(prop, rows) {
	    var pData = getOrCreateProperty(prop);
	    rows.forEach(function(r){
		var row = d3.map(r);
		
		if (!row.has("Name")) {
		    throw "Row was missing name for property " + prop;
		}

		var name = row.get("Name");
		row.remove("Name");
		pData.set(name, OpenDataMap.timeLookup(row));
	    });
	    
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
