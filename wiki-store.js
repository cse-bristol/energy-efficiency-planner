"use strict";

/*global module, require*/

var _ = require("lodash"),
    d3 = require("d3"),
    interopModule = require("gitit-interop"),
    layerPrefix = "layers/",
    layerFileExt = ".geojson",
    prefixLen = layerPrefix.length,
    extLen = layerFileExt.length,
    selectedLimit = 10,
    mapPrefix = "maps/";

var layerName = function(path) {
    return path.slice(prefixLen, path.length - extLen);
};

var mapName = function(path) {
    return path.indexOf(mapPrefix) === 0 ? path.slice(mapPrefix.length) : path;
};

module.exports = function(errors, container, toolbar, layers, worksheet, selection, title, findShapesByName, redraw) {
    var interop = interopModule(errors.warnUser),

	s = interop.schema,
	pageAsMarkdown = s.pageAsMarkdown,
	multiple = s.multiple,
	optional = s.optional,
	boolean = s.boolean,
	float = s.float,
	text = s.text,
	pageLink = s.pageLink,
	fileLink = s.fileLink,

	schema = {
	    layers: multiple({
		layer: fileLink,
		opacity: optional(float(0, 1), 1)
	    }),
	    selection: multiple({
		selection: text
	    }),
	    selectionPage: {
		"selection page": pageLink
	    },
	    sort: multiple({
		sort: text,
		reverse: boolean
	    })
	};

    var wikiLoad = function(page) {
	interop.parser.loadPagesStartingFrom(
	    page, 
	    schema, 
	    function(pageData, fileData) {
		fileData.entries().forEach(function(e) {
		    layers.create(
			layerName(e.key), 
			e.value.features, 
			e.value.bbox);
		});

		var pages = pageData.entries().forEach(function(e) {
		    var loaded = e.value;

		    if (loaded.has("layers")) {
			loaded.get("layers").forEach(function(l) {
			    var layer = layers.get(layerName(l.get("layer")));
			    layer.setOpacity(l.get("opacity"));
			});
		    }

		    if (loaded.has("selection")) {
			selection.select(
			    findShapesByName(
				d3.set(
				    loaded.get("selection").map(function(s) {
					return s.get("selection");
				    }))));
		    }

		    if (loaded.has("sort")) {
			loaded.get("sort").forEach(function(s) {
			    worksheet.sortProperty(s.get("sort"), true);
			    if (s.get("reverse")) {
				// Additional sort on the same property reverses it.
				worksheet.sortProperty(s.get("sort"), true);
			    }
			});
		    }

		});

		title.title(mapName(page));

		redraw();
	    },
	    errors.warnUser
	);
    },

	savePages = function() {
	    var mapPage = mapPrefix + title.title();

	    var selectedThings = selection.names()
		    .map(function(s) {
			return {selection: s};
		    }),
		
		frontPage = {
		    name: mapPage,
		    content: {
			layers: layers.names().map(function(layerName) {
			    var l = layers.get(layerName);
			    return {
				layer: layerPrefix + layerName + layerFileExt,
				opacity: l.options.opacity
			    };
			}),

			sort: _.zip(
			    worksheet.getSortProperties().properties, 
			    worksheet.getSortProperties().reverse)
			    .map(function(pair) {
				return {
				    sort: pair[0],
				    reverse: pair[1]
				};
			    })
		    }
		},
		data = [frontPage];

	    if (selectedThings.length > 10) {
		frontPage.content.selectionPage = {
		    "selection page": mapPage + "/selection"
		};

		data.push({
		    name: mapPage + "/selection",
		    content: {
			selection: selectedThings
		    }
		});
		
	    } else {
		frontPage.content.selection = selectedThings;
	    }

	    return data.map(function(d) {
		return { 
		    name: d.name,
		    content: interop.parser.pageAsMarkdown(d.content, schema)
		};
	    });
	},

	display = interop.makeDisplay(
	    container, 
	    toolbar,
	    function onWikiSave(logMessage) {
		var files = layers.names().map(function(layerName) {
		    var layer = layers.get(layerName);
		    return {
			name: layerPrefix + layerName + layerFileExt,
			content: JSON.stringify({
			    type: "FeatureCollection",
			    features: layer.geometry(),
			    bbox: layer.boundingbox()
			})
		    };
		});

		interop.requests.save(
		    savePages(),
		    files, 
		    logMessage, 
		    errors.informUser,
		    errors.warnUser
		);
	    },
	    wikiLoad,
	    errors.informUser,
	    "Map of " + title.title
	);

    title.onChange(display.wikiPage);
    display.wikiPage(title.title());

    return {
	loadPage: function(page) {
	    wikiLoad(page);
	}
    };
};