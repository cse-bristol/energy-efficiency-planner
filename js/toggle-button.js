"use strict";

/*global module, require*/

var leaflet = require("leaflet");

/*
 A toggle button which obeys the Leaflet conventions.

 Extend this, implementing the leftove methods and setting the classname.
*/
module.exports = leaflet.Control.extend({
    options: {
	position: "topright",
	classname: "leaflet-toggle",
	enabled: false
    },
    includes: leaflet.Mixin.Events,
    onAdd: function(map) {
	this._container = leaflet.DomUtil.create('div', 'toggle-button leaflet-bar');
        this._container.title = "Toggles the layers control.";

	leaflet.DomUtil.addClass(this._container, this.options.classname);

	this.link = leaflet.DomUtil.create('a', this.options.classname + "-link", this._container);
        this.link.href = "#";
	this.linkContent(this.link);

	leaflet.DomEvent
	    .on(this._container, 'dblclick', leaflet.DomEvent.stop)
	    .on(this._container, 'click', leaflet.DomEvent.stop)
	    .on(
		this._container,
		'click',
		function() {
		    this.setEnabled(!this.enabled);
		},
		this
	    );
	
	return this._container;
    },

    setEnabled: function(val) {
	this.enabled = val;
	if (this.enabled) {
	    this.activate();
	} else {
	    this.deactivate();
	}	
    },
    
    activate: function() {
	throw new Error("Activate must be defined by inheritors of toggle-button.");
    },
    deactivate: function() {
	throw new Error("Deactivate must be defined by inheritors of toggle-button.");
    },
    linkContent: function(link) {
	throw new Error("linkContent must be defined by inheritors of toggle-button.");
    }
});
