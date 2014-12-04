"use strict";

/*global module, require*/

/*
 Sends changes we make to the map back to the server automatically.

 The loading parameter is a function which returns true if we shouldn't write because we are currently reading in.
 */
module.exports = function(doWriteOp, onStateReplaced, getTileLayers, getLayers, toolbar, serializeShapeLayer, loading) {
    var writeOp = function(op) {
	if (!loading()) {
	    doWriteOp(op);
	}
    },
	
	/*
	 A convenience device to help set up lots of hooks on an object hierarchy.

	 Call p() to selecte a property further into the hierarchy.
	 Call .getter() to choose a way to get your property. Defaults to looking at the first callback argument.
	 
	 Pass the resulting function into your desired callback.
	 */
	hook = function(p, getter) {
	    var path = p ? p : [];
	    
	    var f = function() {
		writeOp(
		    {
			p: path,
			oi: getter ? getter() : arguments[0]
		    }
		);
	    };
	    
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

	    return f;
	},

	hookBaseOpacity = hook(["tileLayers", "baseOpacity"]),

	hookTileLayers = function(tileLayers) {
	    tileLayers.getBaseLayer().onSetOpacity(hookBaseOpacity);
	    tileLayers.onSetBaseLayer(function(oldBase, newBase) {
		oldBase.clearOnSetOpacity();
		newBase.onSetOpacity(hookBaseOpacity);
		
		writeOp({
		    p: ["base"],
		    oi: newBase.name()
		});
	    });

	    tileLayers.overlays.forEach(function(name, layer) {
		layer.onSetOpacity(
		    hook(["tileLayers", "overlays", name, "opacity"]));
	    });
	},

	hookShapeLayer = function(shapeLayer) {
	    var layerHook = hook(["shapeLayers", shapeLayer.name()]),
		tableHook = layerHook.p("table"),
		table = shapeLayer.resultsTable.dialogue();
	    
	    shapeLayer.onSetOpacity(layerHook.p("opacity"));
	    shapeLayer.onSetZIndex(layerHook.p("z"));

	    shapeLayer.worksheet.sortPropertyChanged(
		layerHook
		    .p("sort")
		    .getter(shapeLayer.worksheet.getSortProperties));

	    shapeLayer.worksheet.baseColourChanged(layerHook.p("colour"));
	    
	    table.onVisibilityChanged(tableHook.p("visible"));
	    table.onSizeChanged(tableHook.p("size"));
	    table.onPositionChanged(tableHook.p("position"));

	    shapeLayer.onRemove(function() {
		writeOp({
		    p: ["shapeLayers", shapeLayer.name()],
		    od: serializeShapeLayer(shapeLayer)
		});
	    });
	},

	hookShapeLayers = function(shapeLayers) {
	    shapeLayers.all().forEach(function(l) {
		hookShapeLayer(l);
	    });
	    
	    shapeLayers.onCreate(function(l) {
		hookShapeLayer(l);
		writeOp({
		    p: ["shapeLayers", l.name()],
		    oi: serializeShapeLayer(l)
		});
	    });
	};

    toolbar.onVisibilityChanged(function(toolText, visible) {
	writeOp({
	    p: ["tools", toolText],
	    oi: visible
	});
    });

    onStateReplaced(function() {
	hookTileLayers(getTileLayers());
	hookShapeLayers(getLayers());
    });
};
