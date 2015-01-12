"use strict";

/*global module, require*/

var floatDialogue = require("floating-dialogue"),
    importCSV = require("./import-csv-file.js"),
    importShapefile = require("./import-shapefile.js"),
    importTopoJSON = require("./import-topojson.js");

/*
 Lets us import shape layers from a variety of file formats.
 */
module.exports = function(toolbar, container, getLayers, saveLayerGeometry, refresh) {
    var content = container.append("div")
    	    .attr("id", "import-dialogue"),

	dialogue = floatDialogue(content)
	    .drag(),

	go = function() {
	    dialogue.show();
	    refresh();
	},

	addLayer = function(name, geometry, bbox) {
	    var layer = getLayers().create(name, geometry, bbox);
	    saveLayerGeometry(layer);
	};

    toolbar.add("I", dialogue);
    
    return {
	csv: function(name, csvFileData) {
	    importCSV(content, name, csvFileData, addLayer);
	    go();
	},

	shapefile: function(name, shapeFileData, dbfFileData, prjFileData) {
	    importShapefile(content, name, shapeFileData, dbfFileData, prjFileData, addLayer);
	    go();
	},

	topojson: function(name, topojsonData) {
	    importTopoJSON(content, name, topojsonData, addLayer);
	    go();
	}
    };
};
