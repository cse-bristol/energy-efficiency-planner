"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

OpenDataMap.sources = function(errors) {
    var newSourceCallbacks = [];
    var sourceLoaded = function(s) {
	newSourceCallbacks.forEach(function(c){
	    c(s);
	});
    };
    
    /*
     A source is a table of data.
     It has a list of names.
     It has a list of properties.
     It provides a data table for those names and properties.
     The data in the table are OpenDataMap.timeLookup values.
     */
    var source = function() {
	return {
	    properties : function() {
		throw "Not implemented";
	    },
	    ids : function() {
		throw "Not implemented";
	    },
	    data : function(properties, ids, time) {
		throw "Not implemented";
	    },
	    name : function() {
		throw "Not implemented";
	    },
	    onChange : function(callback) {
		throw "Not Implemented";
	    }
	};
    }();

    var immutable = function(myProps, myIds, layer, myData, name) {
	var result = {
	    prototype : OpenDataMap.source,
	    properties : function() {
		return myProps;
	    },
	    ids : function() {
		return myIds;
	    },
	    data : function(properties, ids, time) {
		return properties.map(function(p){
		    var i = myProps.indexOf(p);

		    if (i < 0) {
			throw "Unknown property " + p;
		    }
		    
		    return ids.map(function(id){
			var j = myIds.indexOf(id);

			if (j < 0) {
			    throw "Unknown id " + id;
			}

			return myData[i][j].lookup(time);
		    });
		});
	    },
	    name : function() {
		return name;
	    },
	    onChange : function() {
		// no-op
	    }
	};
	sourceLoaded(result);
	return result;
    };

    return {
	onSourceLoad : function(callback) {
	    newSourceCallbacks.push(callback);
	},
	
	empty : function() {
	    return immutable([], [], [], "empty");
	},
	/*
	 Shapes is a deserialized geoJSON representation of some feature.
	 We will use the non-geometric properties to populate our source.
	 */
	fromGeometry : function(shapes, name) {
	    var headers = ["layer", "id"];
	    var headerSet = d3.set(headers);

	    var ids = [];

	    var shapeProperties = shapes.map(function(s){
		var props = d3.map(s.properties);
		props.set("layer", s.layer.name());

		if (s.id === undefined) {
		    throw "Imported shape did not have an id property " + s;
		}

		props.set("id", s.id);

		ids.push(s.id);
		return props;
	    });

	    shapeProperties.forEach(function(s){
		s.keys().forEach(function(k){
		    if (!headerSet.has(k)) {
			headerSet.add(k);
			headers.push(k);
		    }
		});
	    });

	    var data = headers.map(function(h){
		return shapeProperties.map(function(s){
		    var datum = s.has(h) ? s.get(h) : "";
		    return OpenDataMap.timeLookup.constant(datum);
		});
	    });
	    
	    return immutable(headers, ids, data, name);
	},
	/*
	 Creates a source which is a single-property that may change over time.
	 prop is the name of the property.
	 rows is a list of maps
	 each row must have an id property.
	 a row may have have either a constant property, or a series of dates to values
	 
	 Example 1: [{"Name": "my-name", "constant": 5}]
	 Example 2: [{"Name": "my-name", 2013: 5, 2014: 6, 2015: 7}]
	 */
	fromTable : function(prop, rows, name) {
	    var ids = [];
	    var data = [];

	    rows.forEach(function(r){
		var row = d3.map(r);
		
		if (!row.has("id")) {
		    throw "Row was missing id for property " + prop;
		}

		ids.push(row.key);

		if (row.has("constant")) {
		    data.push(OpenDataMap.timeLookup.constant(row));
		} else {
		    row.remove("Name");
		    data.push(OpenDataMap.timeLookup.series(row));
		}	
	    });

	    return immutable([prop], ids, [data], name);
	},
	/*
	 Creates a source which combines a number of other sources.
	 These sources must not overlap: for a given property and a given name, there must only be one source which provides a value.

	 Creating a combined source does not trigger onSourceLoad callbacks.

	 TODO: support for mutable sources.
	 */
	combined : function(sources, name) {
	    var propertiesCache = null;
	    var namesCache = null;

	    var lookupSource = function(sourceName) {
		return sources.filter(function(s){
		    return s.name() === sourceName;
		})[0];
	    };

	    var ensureCache = function(){
		var addSource = function(cache, items, source) {
		    items.forEach(function(i){
			if (!cache.has(i)) {
			    cache.set(i, []);
			}
			cache.get(i).push(source.name());
		    });
		};
		
		if (!propertiesCache) {
		    propertiesCache = d3.map({});
		    namesCache = d3.map({});

		    sources.forEach(function(s){
			addSource(propertiesCache, s.properties(), s);
			addSource(namesCache, s.ids(), s);
		    });
		}
	    };
	    
	    return {
		prototype: source,
		ids : function() {
		    var result = [];
		    sources.forEach(function(s){
			result = result.concat(s.ids());
		    });
		    return result;
		},
		properties : function() {
		    var result = [];
		    sources.forEach(function(s){
			result = result.concat(s.properties());
		    });
		    return result;
		},
		data : function(properties, ids, time) {
		    ensureCache();
		    
		    return properties.map(function(p){
			if (!propertiesCache.has(p)) {
			    throw "Unknown property " + p;
			}

			var propertySources = propertiesCache.get(p);

			return ids.map(function(i){
			    if (!namesCache.has(i)) {
				throw "Unknown id " + i;
			    }

			    var acceptable = namesCache.get(i).filter(function(s){
				return propertySources.indexOf(s) >= 0;
			    });

			    var len = acceptable.length;
			    if (len == 0) {
				return "";
			    } else {
				if (len > 1) {
				    errors.warnUser("Combined source " + name + " found too many sources supplying property " + p + " for id + " + i + ": " + acceptable);
				}
				var source = lookupSource(acceptable[0]);
				    return source.data([p], [i], time)[0][0];				
			    }
			});
		    });
		},
		sources : function() {
		    return sources;
		},
		name : function() {
		    return name;
		}
	    };
	}	
    };
};
