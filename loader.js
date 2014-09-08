"use strict";

/*global d3, module*/

/*
 Load files and store their data. 
 Schedules a callback to run when the file has finished loading (or straightaway if it has already finished).
 */
module.exports = function() {
    var callbacksByFile = d3.map({});
    var completed = d3.map({});

    var module = {
	load : function(file, mechanism, callback) {
	    if (completed.has(file)) {
		callback(completed.get(file));
	    } else if (callbacksByFile.has(file)) {
		callbacksByFile.get(file).push(callback);
	    } else {
		callbacksByFile.set(file, [callback]);
		mechanism(file, function(error, data){
		    if (error) {
			console.error("Error loading file " + file + " " + error);
		    } else {
			completed.set(file, data);
			callbacksByFile.get(file).forEach(function(callback) {
			    callback(data);
			});
		    }
		});
	    }
	}
    };

    return module;
};
