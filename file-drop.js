"use strict";

/*global d3, FileReader, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

if (!OpenDataMap.file) {
    OpenDataMap.file = {};
}

OpenDataMap.file.drop = function(container, errors, handlers){
    var toArray = function(filelist) {
	var arr = [];
	var len = filelist.length;
	for(var i = 0; i < len; i++) {
	    arr.push(filelist[i]);
	}
	
	return arr;
    };
    
    container.on("dragover", function(d, i){
	d3.event.preventDefault();
	d3.event.stopPropagation();
	d3.event.dataTransfer.dropEffect = "copy";
    });
    
    container.on("drop", function(data, index){
	d3.event.preventDefault();
	d3.event.stopPropagation();
	
	var files = toArray(d3.event.dataTransfer.files);

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
			reader.readAsBinaryString(file);
		    } else {
			reader.readAsText(file);
		    }
		});
	    });
	});
    });
};
