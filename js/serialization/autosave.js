"use strict";

var _ = require("lodash"),
    userDelay = 300;

/*global module, require*/

/*
 Sends changes we make to the map back to the server automatically.
 */
module.exports = function(writeOp, canWrite, onStateReplaced, getTileLayers, getShapeLayers, getViewport, serializeShapeLayer, serializeViewport) {
    /*
     A convenience device to help set up lots of hooks on an object hierarchy.

     Call p() to selecte a property further into the hierarchy.
     Call .getter() to choose a way to get your property. Defaults to looking at the first callback argument.
     Call .delay() when you want to limit the number of saves which are made.
     
     Pass the resulting function into your desired callback.
     */
    var
    hook = function(p, getter, delay) {
	var path = p ? p : [],
	    
	    f = function() {
		writeOp(
		    {
			p: path,
			oi: getter ? getter() : arguments[0]
		    }
		);
	    };

	if (delay) {
	    var f_actual = _.debounce(f, userDelay);
	    /*
	     We need to do execute canWrite before we debounce, otherwise we can get into an infinite read -> write -> read with 2 or more clients.
	     */
	    f = function() {
		if (canWrite()) {
		    f_actual.apply(this, arguments);
		}
	    };
	}
	
	f.p = function(extraP) {
	    return hook(path.slice().concat([extraP]), getter);
	};

	f.getter = function(newGetter) {
	    if (getter) {
		throw new Error("Builder with path " + path + " already has a getter.");
	    } else {
		return hook(path.slice(), newGetter);
	    }
	};

	f.delay = function() {
	    if (delay) {
		throw new Error("Have already applied a delay to this hook.");
	    }
	    
	    return hook(path, getter, true);
	};

	return f;
    },

    hookBaseOpacity = hook(["tileLayers", "baseOpacity"]).delay(),

    hookTileLayers = function(tileLayers) {
	tileLayers.getBaseLayer().onSetOpacity(hookBaseOpacity);
	tileLayers.onSetBaseLayer(function(oldBase, newBase) {
	    oldBase.clearOnSetOpacity();
	    newBase.onSetOpacity(hookBaseOpacity);
	    
	    writeOp({
		p: ["tileLayers", "base"],
		oi: newBase.name()
	    });
	});

	tileLayers.overlays.forEach(function(name, layer) {
	    layer.onSetOpacity(
		hook(["tileLayers", "overlays", name, "opacity"]).delay());
	});
    },

    hookShapeLayer = function(shapeLayer) {
	var layerHook = hook(["shapeLayers", shapeLayer.name()]),
	    tableHook = layerHook.p("table"),
	    table = shapeLayer.resultsTable;
	
	shapeLayer.onSetOpacity(layerHook.p("opacity").delay());

	shapeLayer.worksheet.sortPropertyChanged(
	    layerHook
		.p("sort")
		.getter(shapeLayer.worksheet.getSortProperties));

	shapeLayer.worksheet.baseColourChanged(layerHook.p("colour"));
	
	table.onVisibilityChanged(tableHook.p("visible"));
	table.onSizeChanged(tableHook.p("size").delay());
	table.onPositionChanged(tableHook.p("position").delay());
    },

    hookShapeLayers = function(shapeLayers) {
	shapeLayers.all().forEach(function(l) {
	    hookShapeLayer(l);
	});
	
	shapeLayers.onAdd(function(l) {
	    hookShapeLayer(l);
	    writeOp({
		p: ["shapeLayers", l.name()],
		oi: serializeShapeLayer(l)
	    });
	});

	shapeLayers.onRemove(function(shapeLayer) {
	    writeOp({
		p: ["shapeLayers", shapeLayer.name()],
		od: serializeShapeLayer(shapeLayer)
	    });
	});

	shapeLayers.onReorder(function() {
	    writeOp({
		p: ["shapeLayerOrder"],
		oi: shapeLayers.getOrder()
	    });
	});
    },

    hookViewport = function(viewport) {
	viewport.onChange(function() {
	    writeOp({
		p: ["viewport"],
		oi: serializeViewport(viewport)
	    });
	});
    };

    onStateReplaced(function() {
	hookTileLayers(getTileLayers());
	hookShapeLayers(getShapeLayers());
	hookViewport(getViewport());

	// ToDo hook errors, layer control, import
    });
};
