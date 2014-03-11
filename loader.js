"use strict";

/*global d3, OpenDataMap */

if(!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 This is just a way to cache files as we load them.
 */
OpenDataMap.loader = function() {
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
