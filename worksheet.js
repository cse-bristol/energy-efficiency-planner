"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 Holds the names of the currently selected geometry, along with whichever sources are being used with it.
*/
OpenDataMap.worksheet = function(data, errors) {
    var displayProperty = null;
    var source = OpenDataMap.source.combined([], "selected-sources");
    var names = d3.set([]);
    var layersByName = d3.map({});

    var callbacks = [];

    var hasLayer = function(layer) {
	return layersByName.values().indexOf(layer.name()) >= 0;
    };

    var getLayer = function(d) {
	var layerName = d.layer;
	return data.layer(layerName);	
    };

    var addSources = function(newSources) {
	var existing = d3.set(source.properties());
	
	newSources.forEach(function(s){
	    var ok = s.properties().every(function(p){
		if (existing.has(p)) {
		    errors.warnUser("Could not load source " + s.name() + " because it provided a property which was already loaded: " + p  + ".");
		    return false;
		} else {
		    existing.add(p);
		    return true;
		}
	    });

	    if (!ok) {
		newSources.splice(newSources.indexOf(s), 1);
	    }
	});

	source = OpenDataMap.source.combined(source.sources().concat(newSources), "selected-sources");
    };

    var removeSources = function(oldSources) {
	source = OpenDataMap.source.combined(source.sources().filter(function(s){
	    return oldSources.indexOf(s) < 0;
	}), "selected-sources");
    };

    var changed = function() {
	callbacks.forEach(function(c){
	    c();
	});
    };
    
    return {
	selectionChanged : function(values, entering, leaving) {
	    leaving.forEach(function(e){
		var d = d3.select(e).datum();
		var name = d.properties.Name;
		names.remove(name);

		var layer = getLayer(d);
		layersByName.remove(name);
		if(!hasLayer(layer)) {
		    removeSources(data.defaultSources(layer.name()));
		}
	    });

	    entering.forEach(function(e) {
		var d = d3.select(e).datum();
		var name = d.properties.Name;
		names.add(name);

		var layer = getLayer(d);
		var needsLayerSources = !hasLayer(layer);
		layersByName.set(name, layer.name());		
		if (needsLayerSources) {
		    addSources(data.defaultSources(layer.name()));		    
		}
	    });

	    if (source.properties().indexOf(displayProperty) < 0) {
		displayProperty = null;
	    }

	    changed();
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
		changed();
	    }
	    return displayProperty;
	},

	displayData : function(time) {
	    if (displayProperty) {
		return source.data([displayProperty], names.values(), time)[0];
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
