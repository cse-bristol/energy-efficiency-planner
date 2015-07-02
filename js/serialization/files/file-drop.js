"use strict";

/*global require, module*/

var d3 = require("d3"), 
    toArray = require("../../helpers.js").toArray;

module.exports = function(container, errors, handle) {
    container.on("dragover", function(d, i){
	d3.event.preventDefault();
	d3.event.stopPropagation();
	d3.event.dataTransfer.dropEffect = "copy";
    });
    
    container.on("drop", function(data, index){
	d3.event.preventDefault();
	d3.event.stopPropagation();
	
	var files = toArray(d3.event.dataTransfer.files);

	if (files.length > 0) {
	    errors.informUser("Loading files...");
	} else {
	    errors.warnUser("Failed to find any files to load. If you are dropping files, the drop may be blocked by security settings on the files or in your browser.");
	}

	handle(files);
    });
};
