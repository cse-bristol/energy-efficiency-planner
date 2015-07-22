"use strict";

/*global module, require*/

var d3 = require("d3"),
    empty = d3.select(),

    leaflet = require("leaflet"),

    toggleButtonClass = require("../toggle-button.js");

/*
 The left pane will be contracted when the right pane is visible, and expanded when it is hidden.
 */
module.exports = function(leftPane, rightPane, map, visibleByDefault) {
    var buttonClass = toggleButtonClass.extend({
	options: {
	    classname: "layers-control-button",
	    enabled: visibleByDefault
	},
	activate: function() {
	    leftPane.classed("contracted", true);
	    rightPane.classed("element-hidden", false);
	    leaflet.DomUtil.addClass(this._container, 'active');
	},
	deactivate: function() {
	    leftPane.classed("contracted", false);
	    rightPane.classed("element-hidden", true);
	    leaflet.DomUtil.removeClass(this._container, 'active');
	},
	linkContent: function(link) {
	    link.innerHTML = "L";
	}
    }),

	button = new buttonClass();

    rightPane
	.classed("slide-out", true);

    map.addControl(button);

    return {
	setVisibility: function(visibility) {
	    button.setEnabled(visibility);
	},

	getVisibility: function() {
	    return button.enabled;
	},

	reset: function() {
	    button.setEnabled(visibleByDefault);
	}
    };
};
