"use strict";

/*global module, require, FileReader*/

var dropFactory = require("./file-drop.js"),
    handlersFactory = require("./file-handlers.js"),
    importCSV = require("./import-csv-file.js"),
    importShapefile = require("./import-shapefile.js"),
    importTopoJSON = require("./import-topojson.js"),
    coordinateSearchFactory = require("./coordinate-search.js");

/*
 Hooks up the various file import parts to each other.
 */
module.exports = function(body, importControlDiv, focusUpload, focusActive, zoomTo, state, shapeLayerFactory, saveLayerGeometry, errors, progress, update) {
    importControlDiv.append("form")
	.append("input")
	.attr("type", "file")
	.attr("multiple", true)
	.attr("accept", ".csv,.tsv,.json,.shp,.dbf,.prj")
	.attr("id", "import-file-picker")
	.on("change", function(d, i) {
	    handle(
		Array.prototype.slice.call(this.files)
	    );
	    /*
	     Clear the files so that this will work if the user selects the same files twice in a row.
	     */
	    this.parentElement.reset();
	});

    var go = function() {
	focusUpload();
    },
	addLayer = function(name, geometry, bbox) {
	    var layer = shapeLayerFactory(name, geometry, bbox);
	    state.getShapeLayers().add(layer);
	    saveLayerGeometry(layer);
	    focusActive();

	    if (layer.boundingbox) {
	    	zoomTo(layer.boundingbox());
	    }

	    update();
	},

	coordinateSearch = coordinateSearchFactory(importControlDiv, errors.warnUser),

	csv = function(name, csvFileData) {
	    importCSV(importControlDiv, progress, errors, coordinateSearch, name, csvFileData, addLayer);
	    go();
	},

	shapefile = function(name, shapeFileData, dbfFileData, prjFileData) {
	    importShapefile(importControlDiv, progress, errors, coordinateSearch, name, shapeFileData, dbfFileData, prjFileData, addLayer);
	    go();
	},

	topojson = function(name, topojsonData) {
	    importTopoJSON(importControlDiv, progress, errors, coordinateSearch, name, topojsonData, addLayer);
	    go();
	},	

	handlers = handlersFactory(
	    errors,
	    csv,
	    shapefile,
	    topojson
	),
	handle = function(files) {
	    handlers.forEach(function(h){
		var batches = h.tryHandle(files);
		batches.forEach(function(b){
		    
		    b.files.forEach(function(f) {
			var file = f.file;
			files.splice(files.indexOf(file), 1);
			
			var reader = new FileReader();
			reader.onload = function(){
			    b.trigger(file.name, reader.result);
			    progress.ready();
			};
			
			reader.onerror = function(error){
			    errors.warnUser("Failed to load file " + file.name + " " + error);
			    progress.ready();
			};

			progress.waiting();
			if (f.binary) {
			    reader.readAsArrayBuffer(file);
			} else {
			    reader.readAsText(file);
			}
		    });
		});
	    });   
	};

    dropFactory(body, errors, handle);
};
