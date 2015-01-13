"use strict";

/*global module, require*/

var geometries = require("../geometries.js"),
    makeForm = require("./import-file.js");

module.exports = function(container, fileName, shapeFileData, dbfFileData, prjFileData, createLayer) {
    var form = makeForm(
	container,
	[fileName],
	function(formEl) {
	    // We have nothing extra to add to the form;
	},
	function(layerNames) {
	    var geometry = geometries.fromShapefile(shapeFileData, dbfFileData);
	    form.projectLayer(geometry);

	    createLayer(
		layerNames[0],
		geometry.features,
		geometry.bbox
	    );
	}
    );

    if (prjFileData) {
	form.setCoordinateSystem(prjFileData);
    }
};
