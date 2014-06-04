"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 Holds the names of the currently selected geometry, along with whichever sources are being used with it.
*/
OpenDataMap.worksheet = function(el, layers, sources, errors) {
    var sortProperties = [];
    var reverseSort = [];

    var source = sources.combined([], "selected-sources");
    var names = d3.set([]);
    var layersByName = d3.map({});

    var callbacks = [];

    var usesLayer = function(layer) {
	return layersByName.values().indexOf(layer.name()) >= 0;
    };

    var getLayerForShape = function(d) {
	return d.layer;
    };

    var addSources = function(newSources) {
	var missing = newSources.filter(function(s){
	    return source.sources().indexOf(s) < 0;
	});
	
	source = sources.combined(source.sources().concat(missing), "selected-sources");
    };

    var removeSources = function(oldSources) {
	source = sources.combined(source.sources().filter(function(s){
	    return oldSources.indexOf(s) < 0;
	}), "selected-sources");
    };

    var changed = function() {
	callbacks.forEach(function(c){
	    c();
	});

	el.classed("hidden", source.sources().length === 0);
    };

    /* Ensure everything is set up in the empty state. */
    changed();
    
    return {
	selectionChanged : function(values, entering, leaving) {
	    leaving.forEach(function(e){
		var d = d3.select(e).datum();
		var name = d.key;
		names.remove(name);

		var layer = getLayerForShape(d);
		layersByName.remove(name);
		if(!usesLayer(layer)) {
		    removeSources(layer.sources());
		}
	    });

	    entering.forEach(function(e) {
		var d = d3.select(e).datum();
		var name = d.key;
		names.add(name);

		var layer = getLayerForShape(d);
		var needsLayerSources = !usesLayer(layer);
		layersByName.set(name, layer.name());		
		if (needsLayerSources) {
		    addSources(layer.sources());		    
		}
	    });

	    var keepProperties = source.properties();
	    sortProperties = sortProperties.filter(function(property){
		return keepProperties.indexOf(property) >= 0;

	    });

	    changed();
	},

	allData : function(time) {
	    var data = source.data(source.properties(), names.values(), time);
	    return data;
	},

	propertyNames : function() {
	    return source.properties();
	},

	sortProperty : function(property, additional) {
		var i = sortProperties.indexOf(property);
		if (i >= 0) {
		    if (additional) {
			/* reverse this property */
			reverseSort[i] = !reverseSort[i];
		    } else {
			/* sort on just this property, reversed  */
			sortProperties = [property];
			reverseSort = [!reverseSort[i]];
		    }
		} else {
		    if (additional) {
			/* add new property with normal sort  */
			sortProperties.push(property);
			reverseSort.push(false);
		    } else {
			/* sort on just this property */
			sortProperties = [property];
			reverseSort = [false];
		    }
		}
		changed();
	},

	getSortProperties : function() {
	    return {
		"properties" : sortProperties, 
		"reverse" : reverseSort
	    };
	},

	displayData : function(time) {
	    if (sortProperties.length > 0) {
		return source.data([sortProperties[0]], names.values(), time)[0];
	    } else {
		return [];
	    }
	},

	sources : function() {
	    return source.sources();
	},

	addSource : function(newSource) {
	    addSources([newSource]);
	    changed();
	},

	/*
	 Register a callback which will be fired when the data changes.
	 */
	dataChanged : function(callback) {
	    callbacks.push(callback);
	},

	/*
	 Notifies the worksheet that the current date and time has changed.
	 */
	timeChanged : function(time) {
	    changed();
	}
    };
};
