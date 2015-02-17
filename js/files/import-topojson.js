"use strict";

/*global module, require*/

var _ = require("lodash"),
    makeForm = require("./import-file.js"),
    geometries = require("../geometries.js");

module.exports = function(container, progress, errors, name, topojsonData, addLayer) {
    var layers = geometries.manyFromTopoJSON(topojsonData);
    
    var form = makeForm(
	container,
	progress,
	errors,
	/*
	 Using entries here even though keys would be more natural, but we want it to come out in the same order as in the submit function below.
	 */
	layers.entries().map(function(e) {
	    return e.key;
	}),
	function(formEl) {
	    // We have nothing extra to add to the form;
	},
	function(layerNames) {
	    _.zip(
		layerNames,
		layers.entries()
	    ).forEach(
		function(entry) {
		    var layerData = entry[1].value;
		    form.projectLayer(layerData);
		    
		    addLayer(entry[0], layerData);
		}
	    );
	}
    );
};
