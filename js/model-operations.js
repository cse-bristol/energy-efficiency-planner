"use strict";

/*global module, require*/

/*
 Sends changes we make to the map back to the server automatically.
 */
module.exports = function(writeOp, onStateReplaced, getTileLayers, getLayers, toolbar, serializeShapeLayer) {
    /*
     A convenience device to help set up lots of hooks on an object hierarchy.

     Call p() to selecte a property further into the hierarchy.
     Call .getter() to choose a way to get your property. Defaults to looking at the first callback argument.
     
     Pass the resulting function into your desired callback.
     */
    var hook = function(p, getter) {
	var path = p ? p : [];
	
	var f = function() {

	    writeOp(
		{
		    p: path,
		    oi: getter ? getter() : arguments[0]
		}
	    );
	};
	
	f.p = function(p) {
	    return module.exports(path.slice().concat([p], getter));
	};

	f.getter = function(newGetter) {
	    if (getter) {
		throw new Error("Builder with path " + path + " already has a getter.");
	    } else {
		return module.exports(path.slice(), newGetter);
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
		tableHook
		    .p("sort")
		    .getter(shapeLayer.worksheet.getSortProperties));
	    
	    shapeLayer.worksheet.baseColourChanged(tableHook.p("colour"));

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
	    shapeLayers.onCreate(function(l) {
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
