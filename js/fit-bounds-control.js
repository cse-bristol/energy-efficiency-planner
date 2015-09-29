"use strict";

/*global module, require*/

var leaflet = require("leaflet");

module.exports = function(getShapeLayers, getTileLayers, map) {
    var merge = function(a, b) {
	if (!a) {
	    return b;
	} else if (!b) {
	    return a;
	} else {
	    return [
		Math.min(a[0], b[0]),
		Math.min(a[1], b[1]),
		Math.max(a[2], b[2]),
		Math.max(a[3], b[3])
	    ];
	}
    },

	asBBox = function(latLng) {
	    return [
		latLng.getWest(),		
		latLng.getSouth(),
		latLng.getEast(),
		latLng.getNorth()		
	    ];
	};
    
    return leaflet.Control.extend({
	options: {
	    position: "topright",
	    classname: "fit-bounds"
	},
	includes: leaflet.Mixin.Events,
	onAdd: function(leafletMap) {
	    this._container = leaflet.DomUtil.create('div', 'toggle-button leaflet-bar');
            this._container.title = "Pans and zooms the map to show all the layers.";

	    leaflet.DomUtil.addClass(this._container, this.options.classname);

	    this.link = leaflet.DomUtil.create('a', this.options.classname + "-link", this._container);
            this.link.href = "#";
	    this.link.innerHTML = "a";

	    leaflet.DomEvent
		.on(this._container, 'dblclick', leaflet.DomEvent.stop)
		.on(this._container, 'click', leaflet.DomEvent.stop)
		.on(
		    this._container,
		    'click',
		    function() {
			var bbox;

			getShapeLayers().all().forEach(function(shapeLayer) {
			    if (shapeLayer.boundingbox) {
				bbox = merge(bbox, shapeLayer.boundingbox());
			    }
			});

			getTileLayers().overlays.values().forEach(function(tileLayer) {
			    if (tileLayer.options.bounds) {
				bbox = merge(
				    bbox,
				    asBBox(tileLayer.options.bounds)
				);
			    }
			});

			if (bbox) {
			    map.zoomTo(bbox);			    
			}
		    },
		    this
		);
	    
	    return this._container;	
	}
    });
};
