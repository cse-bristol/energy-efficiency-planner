"use strict";

/*global module, require*/
var _ = require("lodash"),
    helpers = require("../helpers.js"),
    callbacks = helpers.callbackHandler;

module.exports = function(shapeLayerFactory, deserializeResultsTable, deserializeLegend, update) {
    var onDeserializeLayer = callbacks(),

	serializeShapeLayer = function(layer) {
	    var table = layer.resultsTable;

	    return {
		opacity: layer.getOpacity(),
		colour: layer.worksheet.baseColour(),
		sort: layer.worksheet.getSortProperties(),
		table: layer.resultsTable.serialize(),
		legend: layer.legend.dialogueState.serialize()
	    };
	},

	deserializeShapeSort = function(serialized, setSortProperty) {
	    _.zip(serialized.properties, serialized.reverse)
		.forEach(function(sort, i) {

		    setSortProperty(
			sort[0],
			/*
			 The first property in the list replaces any existing sort.
			 */
			i !== 0
		    );
		    
		    /*
		     In order to reverse the sort order, sort again by the same property.
		     */
		    if (sort[1]) {
			setSortProperty(sort[1], true);
		    }
		});
	},	

	deserializeShapeLayer = function(shapeLayers, layerName, layerData) {
	    /*
	     Schedule the layer's geometry to be loaded from the database. When it is, fill in the created layer.
	     */
	    onDeserializeLayer(layerName, function(geometry, bbox) {
		var layer = shapeLayerFactory(layerName, geometry, bbox);
		shapeLayers.add(layer);
		
		layer.setOpacity(layerData.opacity);
		layer.worksheet.setBaseColour(layerData.colour);

		deserializeShapeSort(layerData.sort, layer.worksheet.sortProperty);

		if (layerData.table) {
		    layerData.table.id = layerName;
		    layer.resultsTable = deserializeResultsTable(layerData.table);
		}

		if (layerData.legend) {
		    layerData.legend.id = layerName;
		    layer.legend.dialogueState = deserializeLegend(layerData.legend);
		}

		update();
	    });
	};
    
    return {
	deserialize: deserializeShapeLayer,
	serialize: serializeShapeLayer,
	deserializeShapeSort: deserializeShapeSort,
	onDeserializeLayer: onDeserializeLayer.add
    };
};
