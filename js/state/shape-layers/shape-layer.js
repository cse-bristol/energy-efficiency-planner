"use strict";

/*global module, require*/


var d3 = require("d3"),
    idMaker = require("../../id-maker.js"),
    helpers = require("../../helpers.js"),
    callbacks = helpers.callbackHandler,
    fixGeometryIdsFactory = require("./fix-geometry-ids.js"),
    worksheetFactory = require("./worksheet/worksheet.js")(),
    legendFactory = require("../../legend/legend-data.js");

/*
 Create a new shape layer.

 The geometry of the layer is represented as a deserialized GeoJSON object (see: http://geojson.org/geojson-spec.html).
 */
module.exports = function(errors, createResultsTableDialogueData, createLegendDialogueState) {
    var fixGeometryIds = fixGeometryIdsFactory(errors);

    return function(namePreference, geometry, boundingbox) {
	var name = idMaker.fromString(namePreference),
	    opacity = 1.0,
	    onSetOpacity = callbacks(),
	    anyPoints;

	fixGeometryIds(geometry);

	var l = {
	    name: function() {
		return name;
	    },

 	    boundingbox: function() {
		return boundingbox;
	    },

	    geometry: function() {
		return geometry;
	    },
	    
	    /*
	     Does this layer container any Points. This is useful, because it means we can know whether we should present the user with the option to scale these based on data.
	     */
	    anyPoints: function() {
		if (anyPoints === undefined) {
		    var checkGeom = function(o) {
			if (o.type) {
			    switch(o.type) {
			    case "Point":
			    case "MultiPoint":
				anyPoints = true;
				break;
			    default:
				// noop
			    }
			}

			if (o.length) {
			    o.forEach(function(x) {
				checkGeom(x);
			    });
			}

			if (o.features) {
			    checkGeom(o.features);
			}

			if (o.geometries) {
			    checkGeom(o.geometries);
			}

			if (o.geometry) {
			    checkGeom(o.geometry);
			}
		    };

		    checkGeom(geometry);
		}

		return anyPoints;
	    },

	    getOpacity: function() {
		return opacity;
	    },
	    
	    setOpacity: function(o) {
		opacity = o;
		onSetOpacity(o);
	    },
	    
	    legend: function() {
		var colourFun = l.worksheet.getColourFunction();

		var labels = l.worksheet.sortPropertyBins(10);
		
		if (colourFun.isCategorical) {
		    return legendFactory.categorical(
			colourFun.range(),
			colourFun,
			labels
		    );
		    
		} else {
		    return legendFactory.sampled(
			labels,
			l.worksheet.getColourFunction()
		    );		    
		}
	    },

	    worksheet: worksheetFactory(geometry),
	    resultsTable: createResultsTableDialogueData(name),

	    onSetOpacity: onSetOpacity.add
	};

	l.legend.dialogueState = createLegendDialogueState(name);

	geometry.forEach(function(g) {
	    g.key = name + "/" + g.id;
	});

	return l;
    };
};
