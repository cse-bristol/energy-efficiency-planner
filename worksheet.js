"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 Holds the names of the currently selected geometry, along with whichever sources are being used with it.
*/
OpenDataMap.worksheet = function(data) {
    var displayProperty = null;
    var source = OpenDataMap.source.combined([], "selected-sources");
    var names = d3.set([]);
    var layersByName = d3.map({});

    var hasLayer = function(layer) {
	return layersByName.values().indexOf(layer.name()) >= 0;
    };

    var getLayer = function(d) {
	var layerName = d.layer;
	return data.layer(layerName);	
    };

    var addSources = function(newSources) {
	source = OpenDataMap.source.combined(source.sources().concat(newSources), "selected-sources");
    };

    var removeSources = function(oldSources) {
	source = OpenDataMap.source.combined(source.sources().filter(function(s){
	    return oldSources.indexOf(s) < 0;
	}), "selected-sources");
    };
    
    return {
	selectionChanged : function(values, entering, leaving) {
	    leaving.each(function(d, i){
		var name = d.properties.Name;
		names.remove(name);

		var layer = getLayer(d);
		layersByName.remove(name);
		if(!hasLayer(layer)) {
		    removeSources(data.defaultSources(layer.name()));
		}
	    });

	    entering.each(function(d, i) {
		var name = d.properties.Name;
		names.add(name);

		var layer = getLayer(d);
		if (!hasLayer(layer)) {
		    layersByName.set(name, layer.name());
		    addSources(data.defaultSources(layer.name()));		    
		}
	    });
	},

	allData : function(time) {
	    return source.data(source.properties(), names.values(), time);
	},

	propertyNames : function() {
	    return source.properties();
	},

	displayProperty : function(property) {
	    if (property) {
		displayProperty = property;
	    }
	    return displayProperty;
	},

	displayData : function(time) {
	    if (displayProperty) {
		return source.data([displayProperty], names.values(), time)[0];
	    } else {
		return [];
	    }
	}
    };
};
