"use strict";

/*global d3, topojson, FileReader, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.files = function(errors){
    var sourceLoadCallbacks = [];
    var geometryLoadCallbacks = [];

    var withoutExtension = function(fileName) {
	return fileName.replace(/\..*$/, '');
    };
    
    var tsv = function(text, fileName) {
	var data = d3.tsv.parse(text);
	return OpenDataMap.source.fromTable(withoutExtension(fileName), data, fileName);
    };
    tsv.callbacks = sourceLoadCallbacks;

    var csv = function(text, fileName) {
	var data = d3.csv.parse(text);
	return OpenDataMap.source.fromTable(withoutExtension(fileName), data, fileName);
    };
    csv.callbacks = sourceLoadCallbacks;
    
    var mimes = d3.map({
	"text/tab-separated-values" : tsv,
	"text/csv" : csv
    });
    var select = function(mime, filename) {
	if (mimes.has(mime)) {
	    return mimes.get(mime);
	} else {
	    return function(fileData, fileName) {
		errors.warnUser("Unknown file type " + mime + " for file " + filename);
	    };
	}
    };
    
    return {
	drop : function(container) {
	    container.on("dragover", function(d, i){
		d3.event.preventDefault();
		d3.event.stopPropagation();
		d3.event.dataTransfer.dropEffect = "copy";
	    });
	    
	    container.on("drop", function(data, index){
		d3.event.preventDefault();
		d3.event.stopPropagation();
		
		var files = d3.event.dataTransfer.files;
		var len = files.length;
		for (var i = 0; i < len; i++) {
		    var reader = new FileReader();
		    var file = files[i];
		    
		    var success = function() {
			var handler = select(file.type, file.name);
			var result = handler(reader.result, file.name);
			handler.callbacks.forEach(function(c){
			    c(result);
			});
		    };
		    
		    reader.onload = success;
		    reader.onerror = function(error){
			errors.warnUser("Failed to load file " + file.name + " " + error);
		    };
		    reader.readAsText(file);
		}
	    });
	},

	onSourceLoad : function(callback) {
	    sourceLoadCallbacks.push(callback);
	}
    };
};
