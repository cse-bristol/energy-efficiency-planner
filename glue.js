"use strict";

/*global module, require*/

/*
 This file is where all the mess and wiring goes.
 We should aim to reduce its size.
 */

var projectPoint = function(x, y) {
    var point = map.latLngToLayerPoint(new leaflet.LatLng(y, x));
    this.stream.point(point.x, point.y);
};

var sortedByZ = function() {
    return layers.enabled().slice(0).sort(function(a, b){
	return a.options.zIndex - b.options.zIndex;
    });
};

var getLayerEl = function(layerName) {
    return d3.select("#map svg g#" + layerName);
};

var getLayerObjects = function(layerName) {
    return getLayerEl(layerName)
	.selectAll("path");
};

var log2 = function(n) {
    return Math.log(n) / Math.LN2;
};

var zoomTo = function(bbox, map) {
    var x1 = bbox[0],
	y1 = bbox[1],
	x2 = bbox[2],
	y2 = bbox[3];

    var boxSize = Math.max(
	Math.abs(x1 - x2),
	Math.abs(y1 - y2));

    var newZoom = Math.round(
	log2(360 / boxSize) + 1.5);
    console.log("new zoom " + newZoom);
    console.log("new bounds " + [(y1 + y2) / 2, (x1 + x2) / 2]);
    
    map.setView(
	leaflet.latLng(
	    (y1 + y2) / 2,
	    (x1 + x2) / 2),
	newZoom);
};

var startCoordinates = [0, 0],
    zoom = 2,
    d3 = require("d3"),
    _ = require("lodash"),
    dialogue = require("floating-dialogue"),
    geocoder = require("leaflet-control-geocoder"),
    leaflet = require("leaflet"),

    body = d3.select("body"),
    mapDiv = body.append("div").attr("id", "map"),
    toolbar = body.append("div").attr("id", "toolbar"),
    errors = require("./errors.js")(body, toolbar),
    time = require("./time-control.js")(body, toolbar, 2013, 2024, 2014),
    loader = require("./loader.js"),
    layers = require("./layers.js")(errors),
    geometries = require("./geometries.js"),

    title = require("./title.js")(body),
    transform = d3.geo.transform({point: projectPoint});

require("./lib/d3-plugins/geo/tile/tile.js");

var map = new leaflet.Map("map", {
    doubleClickZoom: false
})
	.setView(startCoordinates, zoom);

/* The map will make us an svg. It will automatically sort out its bounds for us. */
map._initPathRoot();

map.addControl(new geocoder({
    email: "research@cse.org.uk"
}));

var overlay = d3.select(map.getPanes().overlayPane)
	.select("svg")
	.attr("id", "overlay"),

    layersControl = require("./layer-control.js")(body, toolbar, map, layers, zoomTo),
    paint = require("./paint.js")(overlay, transform, sortedByZ),
    worksheet = require("./worksheet.js")(),
    resultsTable = require("./results-table.js"),
    colours = require("./colour.js");

var updateResults = function(l) {
    l.resultsTable.info(
	l.worksheet.headers(), 
	l.worksheet.data(),
	l.worksheet.getSortProperties()
    );
};

layers.layerCreated(function(l) {
    var updateLResults = function() {
	return updateResults(l);
    };

    var recolour = function() {
	paint.redrawAll();

	if (l.worksheet.getSortProperties().properties.length > 0) {
	    var colour = l.worksheet.colour(),
		col = l.worksheet.firstSortPropertyI();

	    l.resultsTable.rows().each(function(d, i) {
		d3.select(this)
		    .selectAll("td")
		    .each(function(d, i) {
			var el = d3.select(this);
			var background = i === col ? colour(d) : null,
			    font = i === col ? colours.reverse(background) : null;

			el
			    .style("background-color", background)
			    .style("color", font);
		    });
	    });
	} else {
	    l.resultsTable.cells()
		.style("background-color", null)
		.style("color", null);
	}
    };

    l.worksheet = worksheet(l.geometry());
    l.resultsTable = resultsTable(body);
    l.resultsTable.headerClicked(function(p) {
	l.worksheet.sortProperty(p, d3.event.shiftKey);
    });
    l.resultsTable.rowClicked(function(d, i) {
	var id = d[0];

	d3.select("#map svg g#" + l.name() + " path#" + id)
	    .each(function(d, i) {
		zoomTo(d.bbox, map);
	    });

	l.resultsTable.rows().
	    classed("selected", function(d, i) {
		return d[0] === id;
	    });
    });
    l.resultsTable.rowHovered(function(d, i) {
	var id = d[0];
	
	getLayerObjects(l.name()).classed("highlight", function(d, i) {
	    return d.id === id;
	});
    });
    l.resultsTable.resetClicked(function() {
	l.worksheet.sortProperty();
    });

    // TODO: only redraw the layer which changed.
    l.worksheet.baseColourChanged(recolour);
    l.worksheet.sortPropertyChanged(_.compose(recolour, updateLResults));

    updateResults(l);
    layersControl.update();
});
layers.layerChanged(function(l) {
    if (l) {
	updateResults(l);
    }
    paint.redrawAll();
});
layers.layerRemoved(function(l) {
    l.resultsTable.el().remove();
    paint.redrawAll();
});

map.on("viewreset", paint.redrawAll);

var handlers = require("./file-handlers.js")(
    errors, 
    geometries, 
    layers, 
    paint.redrawAll
);
require("./file-drop.js")(d3.select("body"), errors, handlers);

var wikiStore = require("./wiki-store.js")(
    errors, 
    body,
    toolbar,
    map,
    layersControl,
    layers,
    title,
    function findShapesByName(names) {
	return d3.selectAll("#map svg g path")
	    .filter(function(d, i) {
		return names.has(d.layer.name() + "/" + d.id);
	    });
    },
    paint.redrawAll
);

paint.addClickHandler(function(id, layer) {
    var tbody = layer.resultsTable.tbody().node();

    layer.resultsTable.rows().each(function(d, i) {
	var row = d3.select(this),
	    chosen = row.datum()[0] === id;

	if (chosen) {
	    tbody.scrollTop = this.offsetTop - 
		// Fudge factor found by experimentation, appears to work at different zoom levels.
		// I don't know why this difference is here.
		(2.7 * this.offsetHeight);
	}

	row.classed("selected", chosen);
    });

    layer.resultsTable.dialogue().show();
});

paint.addHoverHandler(function(id, layer) {
    layer.resultsTable.setExtraRow(
	layer.resultsTable.rows().filter(function(d, i) {
	    return d3.select(this)
		.datum()[0] === id;
	})
    );
});

require("./query-string.js")(wikiStore, title);
