"use strict";

/*global module, require, FileReader*/

var dialogueFactory = require("./import-dialogue.js"),
    dropFactory = require("./file-drop.js"),
    handlersFactory = require("./file-handlers.js"),
    importCSV = require("./import-csv-file.js"),
    importShapefile = require("./import-shapefile.js"),
    importTopoJSON = require("./import-topojson.js");

/*
 Hooks up the various file import parts to each other.
 */
module.exports = function(toolbar, container, state, saveLayerGeometry, refresh, errors) {
    var
    go = function() {
	dialogue.show();
	refresh();
    },
    addLayer = function(name, geometry, bbox) {
	var layer = state.getLayers().create(name, geometry, bbox);
	saveLayerGeometry(layer);
    },

    csv = function(name, csvFileData) {
	importCSV(dialogue.content(), name, csvFileData, addLayer);
	go();
    },

    shapefile = function(name, shapeFileData, dbfFileData, prjFileData) {
	importShapefile(dialogue.content(), name, shapeFileData, dbfFileData, prjFileData, addLayer);
	go();
    },

    topojson = function(name, topojsonData) {
	importTopoJSON(dialogue.content(), name, topojsonData, addLayer);
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
		    };
		    
		    reader.onerror = function(error){
			errors.warnUser("Failed to load file " + file.name + " " + error);
		    };
		    
		    if (f.binary) {
			reader.readAsArrayBuffer(file);
		    } else {
			reader.readAsText(file);
		    }
		});
	    });
	});   
    },
    dialogue = dialogueFactory(
	toolbar,
	container,
	handle
    );

    dropFactory(container, errors, handle);
};
