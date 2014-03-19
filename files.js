"use strict";

/*global d3, topojson, FileReader, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.files = function(errors, geometry, layers){
    var sourceLoadCallbacks = [];
    var geometryLoadCallbacks = [];

    var withoutExtension = function(fileName) {
	return fileName.replace(/\..*$/, '');
    };

    var extension = function(fileName) {
	return fileName.split('.').pop();
    };
    
    var tsv = function(text, filename) {
	var data = d3.tsv.parse(text);
	return OpenDataMap.source.fromTable(withoutExtension(filename), data, filename);
    };
    tsv.callbacks = sourceLoadCallbacks;

    var csv = function(text, filename) {
	var data = d3.csv.parse(text);
	return OpenDataMap.source.fromTable(withoutExtension(filename), data, filename);
    };
    csv.callbacks = sourceLoadCallbacks;

    var json = function(text, filename) {
	var data = JSON.parse(text);
	var shapes = geometry.manyFromTopoJSON(filename, data);
	shapes.entries().forEach(function(e){
	    layers.create(e.key, e.value);
	});
    };
    json.callbacks = geometryLoadCallbacks;

    
    var mimes = d3.map({
	"text/tab-separated-values" : tsv,
	"text/csv" : csv,
	"application/json" : json
    });
    var extensions = d3.map({
	"tsv" : tsv,
	"tab" : tsv,
	"csv" : csv,
	"json" : json
    });
    
    var select = function(mime, filename) {
	var ext = extension(filename);
	if (mimes.has(mime)) {
	    return mimes.get(mime);
	} if (extensions.has(ext)) {
	    return extensions.get(ext);
	}else {
	    return function(result, filename) {
		errors.warnUser("File " + filename + " was of unsupported type " + mime + ".");
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
		    
		    var tryHandle = function() {
			var handler = select(file.type, file.name);
			var result = handler(reader.result, file.name);
			if (result) {
			    handler.callbacks.forEach(function(c){
				c(result);
			    });
			}
		    };
		    
		    reader.onload = tryHandle;
		    reader.onerror = function(error){
			errors.warnUser("Failed to load file " + file.name + " " + error);
		    };
		    reader.readAsText(file);
		}
	    });
	},

	onSourceLoad : function(callback) {
	    sourceLoadCallbacks.push(callback);
	},

	onGeometryLoad : function(callback) {
	    geometryLoadCallbacks.push(callback);
	}
    };
};
