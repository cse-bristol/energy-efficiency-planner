"use strict";

/*global module, require, FileReader*/

var dialogueFactory = require("./import-dialogue.js"),
    dropFactory = require("./file-drop.js"),
    handlersFactory = require("./file-handlers.js"),
    importCSV = require("./import-csv-file.js"),
    importShapefile = require("./import-shapefile.js"),
    importTopoJSON = require("./import-topojson.js"),
    coordinateSearchFactory = require("./coordinate-search.js");

/*
 Hooks up the various file import parts to each other.
 */
module.exports = function(toolbar, container, state, shapeLayerFactory, saveLayerGeometry, errors, progress) {
    var
    go = function() {
	dialogueState.setVisibility(true);
	drawing.dialogues();
	drawing.buttons(toolbar);
    },
    addLayer = function(name, geometry, bbox) {
	var layer = shapeLayerFactory(name, geometry, bbox);
	state.getShapeLayers().add(layer);
	saveLayerGeometry(layer);
    },

    coordinateSearch = coordinateSearchFactory(container, errors.warnUser),

    csv = function(name, csvFileData) {
	importCSV(dialogueElement, progress, errors, coordinateSearch, name, csvFileData, addLayer);
	go();
    },

    shapefile = function(name, shapeFileData, dbfFileData, prjFileData) {
	importShapefile(dialogueElement, progress, errors, coordinateSearch, name, shapeFileData, dbfFileData, prjFileData, addLayer);
	go();
    },

    topojson = function(name, topojsonData) {
	importTopoJSON(dialogueElement, progress, errors, coordinateSearch, name, topojsonData, addLayer);
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
    },
    
    dialogue = dialogueFactory(
	"import",
	{
	    position: true,
	    lockToScreen: true
	}
    ),

    dialogueElement,

    dialogueState = dialogueState.createData(),

    drawing = dialogue.drawing(
	function() {
	    return dialogueState;
	},
	container,
	function(dialogues, newDialogues) {
	    dialogueElement = dialogues;
	},
	function(buttons, newButtons) {
	    newButtons.text("I");
	},
	function() {
	    return dialogueState;
	}
    );

    dropFactory(container, errors, handle);
};
