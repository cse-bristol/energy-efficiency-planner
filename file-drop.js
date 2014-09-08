"use strict";

/*global FileReader, require, module*/

var d3 = require("d3"), 
    toArray = require("./helpers.js").toArray;

module.exports = function(container, errors, handlers) {
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
    });
};
