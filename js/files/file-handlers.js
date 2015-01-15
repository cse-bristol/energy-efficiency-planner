"use strict";

/*global module, require, Tiff */

var d3 = require("d3");

/*
 Files is a list of dictionaries. Each dictionary has a file property and a binary property.
 e.g. [{file: "table.tsv", binary: false}, {file: "geometry.shp", binary: true}]
 */
var batch = function(files, onBatchLoad) {
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
		onBatchLoad(results);
	    }
	}
    };
};

var withoutExtension = function(filename) {
    return filename.replace(/\..*$/, '');
};

var getExtension = function(filename) {
    return filename.split('.').pop();
};

var makeFileFilter = function(mimes, extensions) {
    return function(f) {
	return extensions.indexOf(getExtension(f.name)) >= 0 || mimes.indexOf(f.type) >= 0;
    };
};

/*
 Make a handler which will process text files only in batches of 1.
 */
var singleText = function(extension, mime, onFileLoad) {
    var h = {
	tryHandle : function(files) {
	    var handled = files.filter(makeFileFilter([mime], [extension]));

	    return handled.map(function(f){
		return batch(
		    [{file: f, binary: false}],
		    function(results){
			if (results.keys().length !== 1) {
			    throw "Expected results exactly 1 in length.";
			}

			var e = results.entries()[0];
			var filename = e.key;
			var data = e.value;
			onFileLoad(filename, data);
		    }
		);
	    });
	}
    };
    return h;
};

module.exports = function(errors, csvDialogue, shapefileDialogue, topojsonDialogue) {
    var singleTable = function(extension, mime, parser){
	return singleText(extension, mime, function(filename, text) {
	    try {
		var data = parser(text);
		csvDialogue(
		    withoutExtension(filename),
		    data
		);
	    } catch (e) {
		errors.warnUser(e);
	    }
	});
    };
    
    return [
	singleTable("tsv", "test/tab-separated-values", d3.tsv.parse),
	singleTable("csv", "text/csv", d3.csv.parse),
	singleText("json", "application/json", function(filename, text){
	    try {
		var data = JSON.parse(text);
		
		topojsonDialogue(
		    withoutExtension(filename),
		    data
		);
	    } catch (e) {
		errors.warnUser(e);
	    }
	}),
	function shapefile() {
	    var makeBatch = function(shp, dbf, prj) {
		var files = [
		    {file: shp, binary: true},
		    {file: dbf, binary: true}];
		
		if (prj) {
		    files.push({file: prj, binary: false});
		}
		
		return batch(
		    files,
		    function(files) {
			try {
			    
			    shapefileDialogue(
				withoutExtension(shp.name),
				files.get(shp.name),
				files.get(dbf.name),
				prj ? files.get(prj.name) : null
			    );

			} catch (e) {
			    errors.warnUser(e);
			}
		    }
		);
	    };
	    
	    var h = {
		tryHandle : function(files) {
		    var shp = d3.map({});
		    var dbf = d3.map({});
		    var prj = d3.map({});

		    files.forEach(function(f){
			var ext = getExtension(f.name);
			var name = withoutExtension(f.name);
			if(ext === "shp") {
			    shp.set(name, f);
			} else if (ext === "dbf") {
			    dbf.set(name, f);
			} else if (ext === "prj") {
			    prj.set(name, f);
			}
		    });

		    if (shp.size() === 1 && dbf.size() === 1 &&
			(prj.size() < 2)) {
			/* In the case that we've got one of each type of file,
			 don't bother trying to match up the filenames. */
			if (prj.size() === 1) {
			    return[makeBatch(
				shp.entries()[0].value,
				dbf.entries()[0].value,
				prj.entries()[0].value)];
			} else {
			    return[makeBatch(
				shp.entries()[0].value,
				dbf.entries()[0].value)];
			}

		    } else {
			var batches = [];
			shp.entries().forEach(function(e){
			    var shpName = e.key;
			    if (dbf.has(shpName)) {
				if (prj.has(shpName)) {
				    batches.push(makeBatch(
					e.value,
					dbf.get(shpName),
					prj.get(shpName)));
				} else {
				    batches.push(makeBatch(e.value, dbf.get(shpName)));
				}
			    }
			});
			return batches;
		    }
		}
	    };
	    return h;
	}(),

	/*
	 * Fail case handlers - should come after real shp+dbf handler.
	 */
	singleText("shp", null, function(filename, text){
	    errors.warnUser("Cannot load a shapefile by itself. Please import .dbf and .shp files together: " + filename);
	}),
	singleText("dbf", null, function(filename, text){
	    errors.warnUser("Cannot load a dbf file by itself. Please import .dbf and .shp files together: " + filename);
	}),
	singleText("prj", null, function(filename, text){
	    errors.warnUser("Cannot load a prj file by itself. Please import .prj, .dbf and .shp files together: " + filename);
	}),	
	
	function fallback() {
	    var h = {
		tryHandle : function(files) {
		    files.forEach(function(f){
			errors.warnUser("Can't load file " + f.name + " with " + (f.type ? f.type : "unknown") + " type.");
		    });
		    return [];
		}
	    };
	    return h;
	}()
    ];
};
