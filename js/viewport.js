"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler;

/*
 Represents the default zoom and coordinates for a map.

 This is the position that the map will display in when it is first loaded.
 */
module.exports = function() {
    var coordinates = leaflet.latLng(0, 0),
	zoom = 2,
	onChange = callbacks();

    return {
	onChange: onChange.add,

	set: function(c, z) {
	    if (!c instanceof leaflet.latLng) {
		throw new Error("Coordinates should be a Leaflet LatLng object, was: " + c + " of type: " + Object.prototype.toString.call(c));
	    }
	    
	    if (!helpers.isInt(z)) {
		throw new Error("Zoom level must always be an integer, was: " + z);
	    }

	    coordinates = c;
	    zoom = z;
	    onChange();
	},

	coordinates: function() {
	    return coordinates;
	},

	lat: function() {
	    return coordinates.lat;
	},

	lng: function() {
	    return coordinates.lng;
	},

	zoom: function() {
	    return zoom;
	}
    };
};
