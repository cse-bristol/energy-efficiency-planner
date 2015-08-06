"use strict";

/*global module, require*/

var d3 = require("d3"),
    leaflet = require("leaflet"),
    geocoderFactory = require("leaflet-control-geocoder");
    
/*
 Modifies the leaflet-control-geocoder library such that the control will be displayed inside the file menu contents 
 */
module.exports = function(map) {
    var geocoder = new geocoderFactory({
	    email: "research@cse.org.uk",
	    collapsed: false,
	    placeholder: 'Find Location'
    });

    geocoder.addTo = function(map) {
      this._map = map;
      var container = this._container = this.onAdd(map);

	leaflet.DomUtil.removeClass(container, 'leaflet-bar');

      return this;
    };

    map.addControl(geocoder);

    return {
	insertInContainer: function(container) {
	    container
		.insertBefore(
		    geocoder._container,
		    container.childNodes[1]
		);
	}
    };
};
