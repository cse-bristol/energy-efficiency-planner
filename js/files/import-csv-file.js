"use strict";

/*global module, require*/

var _ = require("lodash"),
    d3 = require("d3"),
    helpers = require("../helpers.js"),
    noDrag = helpers.noDrag,
    isNum = helpers.isNum,
    makeForm = require("./import-file.js");

/*
 Import a single layer from a csv file (with a header row).

 Provides a form which lets you select columns to be the latitude and longitude. Creates a point for each data row in the file.
 */
module.exports = function(container, fileName, data, createLayer) {
    if (data.length === 0) {
	throw new Error("Imported csv file had no data.");
    }

    var possibleColumns = function() {
	var keys = Object.keys(data[0]);

	return keys.filter(function(k) {
	    return _.every(
		data,
		function(row) {
		    return isNum(row[k]);
		}
	    );
	});
    }();

    if (possibleColumns.length === 0) {
	throw new Error("Could not find any columns to use for longitude or latitude. These require a column which contains only numeric data.");
    }
    
    var columnOptions = function(container, labelText, startColumn) {
	var label = container.append("label")
		.text(labelText),
	    
	    colChoice = label.append("select")
		.call(noDrag);

	colChoice.selectAll("option")
	    .data(possibleColumns)
	    .enter()
	    .append("option")
	    .attr("value", function(d, i) {
		return d;
	    })
	    .attr("enabled", function(d, i) {
		return d === startColumn;
	    })
	    .text(function(d, i) {
		return d;
	    });

	return colChoice;
    },

	guessColumn = function(guesses) {
	    if (possibleColumns.length === 1) {
		return possibleColumns[0];
	    }

	    while(guesses.length > 0) {
		var guess = guesses.pop(),
		    current = possibleColumns.filter(function(column) {
			return column.toLowerCase().indexOf(guess) === 0;
		    });

		if (current.length > 0) {
		    /*
		     We found some likely columns. We'll pick the first of them.
		     */
		    return current[0];
		}
	    }

	    /*
	     We didn't find any likely matching columns. We'll pick the first column, and the user can correct it.
	     */
	    return possibleColumns[0];
	};

    var lngColumn,
	latColumn,
	form = makeForm(
	    container,
	    [fileName],
	    function(formEl) {
		var csvFields = formEl.append("fieldset")
			.attr("id", "csv-columns-import");

		csvFields.append("legend")
		    .text("Coordinate Columns");

		lngColumn = columnOptions(csvFields, "lng: ", guessColumn(["lng", "long", "x"]));
		latColumn = columnOptions(csvFields, "lat: ", guessColumn(["lat", "y"]));
	    },
	    function(layerNames) {
		var
		lngColumnVal = lngColumn.node().options[
		    lngColumn.node().selectedIndex
		].value,
		
		latColumnVal = latColumn.node().options[
		    latColumn.node().selectedIndex
		].value;
		
		var geometry = {
		    type: "GeometryCollection",
		    geometries: data.map(function(row) {
			// TODO remove latColumnVal and lngColumnVal from row before adding it in

			return {
			    type: "Point",
			    coordinates: [
				row[lngColumnVal],
				row[latColumnVal]
			    ],
			    properties: row
			};
		    })
		};
		form.projectLayer(geometry);
		
		createLayer(
		    layerNames[0],
		    geometry
		);
	    });
};



