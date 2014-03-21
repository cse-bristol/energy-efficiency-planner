"use strict";

/*global d3, OpenDataMap */

if (!OpenDataMap) {
    var OpenDataMap = {};
}

if (!OpenDataMap.file) {
    OpenDataMap.file = {};
}

OpenDataMap.file.handlers = function(errors, geometries, layers) {
    var all = [];
    var newSourceCallbacks = [];

    var withoutExtension = function(filename) {
	return filename.replace(/\..*$/, '');
    };

    var getExtension = function(filename) {
	return filename.split('.').pop();
    };

    /*
     Make a handler which will process text files only in batches of 1.
     */
    var singleText = function(extension, mime, onLoad) {
	var h = {
	    tryHandle : function(files) {
		var handled = files.filter(function(f) {
		    if (extension && extension === getExtension(f.name)) {
			return true;
		    }
		    if (mime && mime === f.type) {
			return true;
		    }
		    return false;
		});

		return handled.map(function(f){
		    return OpenDataMap.file.batch(
			[{file: f, binary: false}],
			function(results){
			    if (results.keys().length !== 1) {
				throw "Expected results exactly 1 in length.";
			    }

			    var e = results.entries()[0];
			    var filename = e.key;
			    var data = e.value;
			    onLoad(filename, data);
			}
		    );
		});
	    }
	};
	all.push(h);
	return h;
    };

    var singleTable = function(extension, mime, parser){
	return singleText(extension, mime, function(filename, text){
	    var data = parser(text);
	    var s = OpenDataMap.source.fromTable(withoutExtension(filename), data, filename);
	    newSourceCallbacks.forEach(function(c){
		c(s);
	    });
	});
    };

    return {
	all : all,

	onSourceLoad : function(callback) {
	    newSourceCallbacks.push(callback);
	},

	tsv : singleTable("tsv", "test/tab-separated-values", d3.tsv.parse),
	csv : singleTable("csv", "text/csv", d3.csv.parse),
	json : singleText("json", "application/json", function(filename, text){
	    var data = JSON.parse(text);
	    var shapes = geometries.manyFromTopoJSON(filename, data);
	    shapes.entries().forEach(function(e){
		layers.create(e.key, e.value);
	    });
	}),

	shpWithDbf : function() {
	    var makeBatch = function(shp, dbf) {
		return OpenDataMap.file.batch(
		    [{file: shp, binary: true},
		     {file: dbf, binary: true}],
		    function(files){
			var shape = geometries.fromShapefile(
			    files.get(shp.name),
			    files.get(dbf.name));
			
			var name = withoutExtension(shp.name);
			layers.create(name, shape);
		    }
		);
	    };
	    
	    var h = {
		tryHandle : function(files) {
		    var shp = d3.map({});
		    var dbf = d3.map({});

		    files.forEach(function(f){
			var ext = getExtension(f.name);
			if(ext === "shp") {
			    shp.set(withoutExtension(f.name), f);
			} else if (ext === "dbf") {
			    dbf.set(withoutExtension(f.name), f);
			}
		    });

		    if (shp.length === 1 && dbf.length === 1) {
			/* In the case that we've got one of each type of file,
			 don't bother trying to match up the filenames. */
			return[makeBatch(shp.entries[0].value, dbf.entries[0].value)];
		    } else {
			var batches = [];
			shp.entries().forEach(function(e){
			    var shpName = e.key;
			    if (dbf.has(shpName)) {
				batches.push(makeBatch(e.value, dbf.get(shpName)));
			    }
			});
			return batches;
		    }
		}
	    };
	    all.push(h);
	    return h;
	}(),

	/*
	 * Fail case handlers - should come after real shp+dbf handler.
	 */
	shp : singleText("shp", null, function(filename, text){
	    errors.warnUser("Cannot load a shapefile by itself. Please import .dbf and .shp files together: " + filename);
	}),
	dbf: singleText("dbf", null, function(filename, text){
	    errors.warnUser("Cannot load a dbf file by itself. Please import .dbf and .shp files together: " + filename);
	})
	
    };
};

/*
 Files is a list of dictionaries. Each dictionary has a file property and a binary property.
 e.g. [{file: "table.tsv", binary: false}, {file: "geometry.shp", binary: true}]
 */
OpenDataMap.file.batch = function(files, onLoad) {
    var results = d3.map({});
    var filenames = files.map(function(f){
	return f.file.name;
    });
    
    return {
	files : files,
	trigger : function(file, result) {
	    if (filenames.indexOf(file) < 0) {
		throw "File " + file + " does was not part of this batch.";
	    }

	    if (results.has(file)) {
		throw "File " + file + " was loaded twice";
	    }

	    results.set(file, result);

	    if (results.keys().length === files.length) {
		onLoad(results);
	    }
	}
    };
};
