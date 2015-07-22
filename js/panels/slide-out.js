"use strict";

/*global module, require*/

var d3 = require("d3"),
    empty = d3.select(),

    leaflet = require("leaflet"),

    toggleButtonClass = require("../toggle-button.js");

/*
 The left pane will be contracted when the right pane is visible, and expanded when it is hidden.
 */
module.exports = function(mainPane, slidingPane, buttonText, visibleByDefault) {
    var buttonClass = toggleButtonClass.extend({
	options: {
	    classname: "layers-control-button",
	    enabled: visibleByDefault
	},
	activate: function() {
	    mainPane.classed("contracted", true);
	    slidingPane.classed("enabled", true);
	    leaflet.DomUtil.addClass(this._container, 'active');
	},
	deactivate: function() {
	    mainPane.classed("contracted", false);
	    slidingPane.classed("enabled", false);
	    leaflet.DomUtil.removeClass(this._container, 'active');
	},
	linkContent: function(link) {
	    link.innerHTML = buttonText;
	}
    }),

	button = new buttonClass();

    slidingPane
	.classed("slide-out", true);

    return {
	setVisibility: function(visibility) {
	    button.setEnabled(visibility);
	},

	getVisibility: function() {
	    return button.enabled;
	},

	reset: function() {
	    button.setEnabled(visibleByDefault);
	},

	attach: function(map) {
	    map.addControl(button);
	}
    };
};
