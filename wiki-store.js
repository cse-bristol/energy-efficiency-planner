"use strict";

/*global module, require*/

var _ = require("lodash"),
    d3 = require("d3"),
    interopModule = require("gitit-interop"),
    layerPrefix = "layers/",
    layerFileExt = ".geojson",
    prefixLen = layerPrefix.length,
    extLen = layerFileExt.length;

var layerName = function(path) {
    return path.slice(prefixLen, path.length - extLen);
};

module.exports = function(errors, container, buttonContainer, layers, worksheet, selection, title, findShapesByName) {
    var wikiLoad = function(page) {
	interop.parser.loadPagesStartingFrom(
	    page, 
	    schema, 
	    function(pageData, fileData) {
		fileData.entries().forEach(function(e) {
		    layers.create(layerName(e.key), e.value);
		});

		var pages = pageData.entries();
		if (pages.length !== 1) {
		    errors.warnUser("Map page had child pages - this should never happen.");
		}
		var loaded = pages[0].value;
		
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
			    worksheet.sortPropert(s.get("sort"), true);
			}
		    });
		}

		title.title(page);
	    },
	    errors.warnUser
	);
    },
	
	interop = interopModule(
	    errors, 
	    function onWikiSave(logMessage) {
		var files = layers.names().map(function(layerName) {
		    return {
			name: layerPrefix + layerName + layerFileExt,
			content: JSON.stringify(
			    layers.get(layerName)
				.geometry())
		    };
		});

		interop.requests.save(
		    [{
			name: title.title(),
			content: parser.pageAsMarkdown(
			    {
				layers: layers.names().map(function(layerName) {
				    var l = layers.get(layerName);
				    return {
					layer: layerPrefix + layerName + layerFileExt,
					opacity: l.options.opacity
				    };
				}),

				selection: selection.names().map(function(s) {
				    return {selection: s};
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
			    }, 
			    schema)
		    }],
		    files, 
		    logMessage, 
		    errors.informUser,
		    errors.warnUser
		);
	    },
	    wikiLoad
	),

	parser = interop.parser,
	pageAsMarkdown = parser.pageAsMarkdown,
	multiple = parser.multiple,
	optional = parser.optional,
	boolean = parser.boolean,
	float = parser.float,
	text = parser.text,
	pageLink = parser.pageLink,
	fileLink = parser.fileLink,

	display = interop.makeDisplay(container, buttonContainer),

	schema = {
	    layers: multiple({
		layer: fileLink,
		opacity: optional(float(0, 1), 1)
	    }),
	    selection: multiple({
		"selection" : text
	    }),
	    sort: multiple({
		sort: text,
		reverse: boolean
	    })
	};

    return {
	baseURL: function() {
	    return interop.requests.baseURL.apply(this, arguments);
	},
	baseURLValid: function() {
	    return interop.requests.baseURLValid.apply(this, arguments);
	},
	loadPage: function(page) {
	    wikiLoad(page);
	}
    };
};