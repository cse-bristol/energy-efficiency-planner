"use strict";

/*global module, require*/

var d3 = require("d3"),
    empty = d3.select(),

    opacitySliderFactory = require("./opacity-slider.js"),

    helpers = require("../helpers.js"),
    noop = helpers.noop;

module.exports = function(getTileLayers, container, triggerUpdate) {
    var getBaseLayer = function(ignored) {
	return getTileLayers().getBaseLayer();
    },
	
	baseOpacitySlider = opacitySliderFactory(getBaseLayer, noop),

	baseForm = container.append("form")
	    .classed("base-form", true)
	    .datum(
		getBaseLayer().name()
	    ),

	baseDiv = baseForm
	    .append("div");

    /*
     Create the opacity slider and put it into its initial position.
     */
    baseOpacitySlider(baseForm, baseForm);

    return {
	update: function(baseLayer, baseLayerNames) {
	    baseForm.datum(
		baseLayer.name()
	    );
	    
	    var baseLabels = baseDiv
		    .selectAll("label")
		    .data(
			baseLayerNames,
			function(d, i) {
			    return d;
			});

	    baseLabels.exit().remove();

	    var newBaseLabels = baseLabels
		    .enter()
		    .append("label");

	    newBaseLabels.append("input")
		.attr("type", "radio")
		.attr("name", "base-layer")
		.attr("value", function(d, i) {
		    return d;
		})
		.on("click", function(d, i) {
		    var tileLayers = getTileLayers();
		    tileLayers.setBaseLayer(
			tileLayers.base.get(d));

		    triggerUpdate();
		});

	    newBaseLabels.append("span")
		.text(function(d, i) {
		    return d;
		});

	    baseLabels.select("input")
		.attr("checked", function(d, i) {
		    return d === baseLayer.name() ? "checked" : null;
		});

	    baseOpacitySlider(baseForm, empty);
	}
    };
};
