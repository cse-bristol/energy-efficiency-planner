"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    helpers = require("./helpers.js"),
    callbacks = helpers.callbackHandler;

module.exports = function(setView, getCenter, getZoom, getViewpoint, makeButton, update) {
    var onViewpointSaved = callbacks(),

    loadViewpointClass = leaflet.Control.extend(
	{
	    options: {
		position: "topright",
		classname: "load-viewpoint"
	    },
	    includes: leaflet.Mixin.Events,
	    onAdd: function(leafletMap) {
		this._container = leaflet.DomUtil.create('div', 'load-viewpoint-button leaflet-bar');
		this._container.title = "Load a saved viwpoint.";
		this.link = leaflet.DomUtil.create('a', this.options.classname, this._container);
		this.link.href = "#";
		this.link.innerHTML = "V";
		
		leaflet.DomEvent
		    .on(this._container, 'dblclick', leaflet.DomEvent.stop)
		    .on(this._container, 'click', leaflet.DomEvent.stop)
		    .on(
			this._container,
			'click',
			function() {
			    var viewpoint = getViewpoint();
			    
			    setView(
				viewpoint.coordinates(),
				viewpoint.zoom()
			    );

			    update();
			},
			this
		    );

		this.savedIndicatorWrapper = leaflet.DomUtil.create('div', 'viewpoint-saved-indicator-wrapper', this._container);
		this.savedIndicator = leaflet.DomUtil.create('div', 'viewpoint-saved-indicator', this.savedIndicatorWrapper);
		this.savedIndicator.innerHTML = 'Viewpoint saved';
		
		return this._container;
	    }
	}
    ),

	loadViewpoint = new loadViewpointClass(),

	redraw = function() {
	    if (getViewpoint().setManually()) {
		leaflet.DomUtil.addClass(loadViewpoint._container, "active");
	    } else {
		leaflet.DomUtil.removeClass(loadViewpoint._container, "active");
	    }
	};

    onViewpointSaved.add(redraw);
    onViewpointSaved.add(function() {
	leaflet.DomUtil.addClass(
	    loadViewpoint.savedIndicator,
	    'enabled'
	);

	window.setTimeout(
	    function() {
		leaflet.DomUtil.removeClass(
		    loadViewpoint.savedIndicator,
		    'enabled'
		);
	    },
	    10
	);
    });
    
    return {
	set: makeButton(
	    "Set Viewpoint",
	    null,
	    function() {
		getViewpoint().set(
		    getCenter(),
		    getZoom()
		);

		onViewpointSaved();
	    },
	    {}
	),

	get: loadViewpoint,

	update: redraw
    };
};
