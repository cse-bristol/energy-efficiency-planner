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
			var source = tsv(reader.result, file.name);
			sourceLoadCallbacks.forEach(function(c){
			    c(source);
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
