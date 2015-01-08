"use strict";

/*global module, require*/

/*
 Listens to incoming operations from the server, and updates the map accordingly (only if we are in autosave mode).

 This is the counterpart to model-operations.js (which takes updates to the map and sends them to the server as operations).

 onOperation: a callback handler. The callbacks should pass us the operation.

 shouldListen: returns false is we are currently writing. Used so that we don't get into a loop of reading and writing out own operations.

 */
module.exports = function(
    getShapeLayers, deserializeShapeSort, deserializeShapeLayer,
    getTileLayers,
    getViewport, deserializeViewport,
    showTool, hideTool) {
    
    var readOp = function(op) {
	switch(op.p[0]) {
	case "tileLayers":
	    readTileLayers(op);
	    break;

	case "shapeLayers":
	    readShapeLayers(op);
	    break;

	case "viewport":
	    deserializeViewport(getViewport(), op.oi);
	    break;

	case "tools":
	    readToolVisibility(op.p[1], op.oi);
	    break;
	    
	default:
	    // We don't know how to read this event.
	    break;
	}
    },

	readTileLayers = function(op) {
	    var p = op.p[1],
		tiles = getTileLayers();
	    
	    switch(p) {
	    case "baseOpacity":
		tiles.getBaseLayer().setOpacity(op.oi);
		break;
	    case "base":
		if (!tiles.base.has(op.oi)) {
		    throw new Error("Unknown base layer " + op.oi);
		} else {
		    tiles.setBaseLayer(
			tiles.base.get(op.oi)
		    );
		}
		break;

	    case "overlays":
		var overlay = op.p[2];

		if (!op.p[3] === "opacity") {
		    throw new Error("Unknown tile layer property " + op.p[3]);
		}

		if (!tiles.overlays.has(overlay)) {
		    throw new Error("Unknown tile overlay " + overlay);
		}

		tiles.overlays.get(overlay).setOpacity(op.oi);
		
		break;
	    default:
		throw new Error("Unknown tileLayers property: " + p);
	    }
	},

	readShapeLayers = function(op) {
	    var layerName = op.p[1];

	    if (op.p.length === 2) {
		if (op.oi !== undefined) {
		    deserializeShapeLayer(getShapeLayers(), layerName, op.oi);
		    
		} else if (op.od !== undefined) {
		    getShapeLayers().get(layerName).remove();
		}
		
	    } else {
		var layer = getShapeLayers().get(layerName);
		
		switch(op.p[2]) {
		case "table":
		    readShapeTable(op.p[3], op.oi, layer);
		    break;
		case "z":
		    layer.setZIndex(op.oi);
		    break;
		case "opacity":
		    layer.setOpacity(op.oi);
		    break;
		case "sort":
		    deserializeShapeSort(op.oi, layer.worksheet.sortProperty);
		    break;
		case "colour":
		    layer.worksheet.baseColour(op.oi);
		    break;
		default:
		    throw new Error("Unknown shape layer property " + op.p[2]);
		}
	    }
	},

	readShapeTable = function(prop, change, layer) {
	    var table = layer.resultsTable.dialogue();
	    
	    switch(prop) {
	    case "visible":
		if (change === true) {
		    table.show();
		} else if (change === false) {
		    table.hide();
		} else {
		    throw new Error("Unknown table visibility " + change);
		}
		break;
	    case "size":
		table.size(change);
		break;
	    case "position":
		table.position(change);
		break;
	    default:
		throw new Error("Unknown shape table property " + prop);
	    }
	},
	
	readToolVisibility = function(tool, visible) {
	    if (visible === true) {
		showTool(tool);
		
	    } else if (visible === false) {
		hideTool(tool);
		
	    } else {
		throw new Error("Unknown tool operation " + visible);
	    }
	};

    return {
	readOp: readOp
    };
};
