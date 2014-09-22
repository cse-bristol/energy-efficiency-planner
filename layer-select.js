"use strict";

/*global module, require*/

var d3 = require("d3"),
    helpers = require("./helpers.js"),
    identity = helpers.identity,
    callbackHandler = helpers.callbackHandler;

/*
 When we click on a layer in the list of layers,
 get all of the shapes in that layer and select them.
 */
module.exports = function(L, zoomToLayer, layers, selection, getLayerObjects, layerFilter) {
    return function(obj, container, row, control) {
	if (layerFilter === undefined
	    || layerFilter(obj.layer, obj.name, obj.overlay)) {

	    var label = row.children.item(0);

	    var layerNameSpan = label.children.item(1);
	    L.DomUtil.addClass(layerNameSpan, "select-and-focus");

	    L.DomEvent.on(layerNameSpan, "click", function(event) {
		event.preventDefault();
		event.stopPropagation();

		if (!event.shiftKey) {
		    zoomToLayer(obj.layer);
		}
		selection.select(getLayerObjects(obj.layer.name()), event.shiftKey);

	    }, this);
	}
    };
};
