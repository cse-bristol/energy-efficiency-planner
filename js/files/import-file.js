"use strict";

/*global module, require*/

var d3 = require("d3"),
    helpers = require("../helpers.js"),
    noDrag = helpers.noDrag,
    geometries = require("../geometries.js"),
    asLayerName = require("../id-maker.js").fromString;

/*
 Provides a file import form with cancel and import buttons, and a section for choosing a coordinate system.
 */
module.exports = function(container, progress, errors, layerNames, makeExtraContent, onSubmit) {
    var content = container.append("form")
	    .classed("file-import", true),

	namesFieldset = content.append("fieldset")
	    .classed("imported-names-fieldset", true),

	namesLegend = namesFieldset.append("legend")
	    .text("Layer Names"),

	names = namesFieldset.selectAll("input.imported-layer-name")
	    .data(layerNames)
	    .enter()
	    .append("input")
	    .attr("type", "text")
	    .attr("value", function(d, i) {
		return asLayerName(d);
	    })
	    .classed("imported-layer-name", true)
	    .on("input", function(d, i) {
		this.value = asLayerName(this.value);
	    })
	    .call(noDrag);

    makeExtraContent(content);

    var coordinateSystemFieldset = content.append("fieldset")
	    .classed("coordinate-system-fieldset", true),

	coordinateSystemLegend = coordinateSystemFieldset.append("legend")
	    .text("Coordinate System"),

	coordinateSystem = coordinateSystemFieldset.append("textarea")
	    .classed("coordinate-system", true)
    	    .attr("placeholder", "assumes Web Mercator if left blank")
	    .call(noDrag),

	buttonFieldset = content.append("fieldset")
	    .classed("button-fieldset", true),

	cancelButton = buttonFieldset.append("button")
	    .classed("cancel-file-import", true)
	    .text("Cancel")
	    .on("click", function(d, i) {
		d3.event.preventDefault();
		d3.event.stopPropagation();
		content.remove();
	    }),

	importButton = buttonFieldset.append("button")
	    .classed("confirm-file-import", true)
	    .text("Import")
	    .on("click", function(d, i) {
		d3.event.preventDefault();
		d3.event.stopPropagation();
		/*
		 This doesn't appear to work - I think the button press is overriding it and the browser is doing too much to be able to redraw.

		 Consider rewriting using web workers?
		 */
		progress.waiting();

		try {
		    onSubmit(
			names[0].map(
			    function(name) {
				return name.value;
			    }
			)
		    );
		    content.remove();
		} catch (e) {
		    errors.warnUser(e);
		} finally {
		    progress.ready();
		}
	    });

    return {
	el: content,
	projectLayer: function(geojsonLayerData) {
	    if (coordinateSystem.node().value) {
		geometries.projectLayer(
		    coordinateSystem.node().value,
		    geojsonLayerData);
	    }
	},
	setCoordinateSystem: function(text) {
	    coordinateSystem.node().value = text;
	}
    };
};
