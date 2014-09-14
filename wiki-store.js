"use strict";

/*global module, require*/

var _ = require("lodash"),
    d3 = require("d3"),
    interopModule = require("gitit-interop"),
    layerPrefix = "layers/";

module.exports = function(errors, container, buttonContainer, layers, worksheet, selection, title, findShapesByName) {
    var wikiLoad = function(page) {
	interop.parser.loadPagesStartingFrom(
	    title.title(), 
	    schema, 
	    function(pageData, fileData) {
		fileData.entries().forEach(function(e) {
		    var geometry = JSON.parse(e.value);
		    layers.create(e.key, geometry);
		});

		var pages = pageData.entries();
		if (pages.length !== 1) {
		    errors.warnUser("Map page had child pages - this should never happen.");
		}
		var page = pages[0].value;
		
		if (page.layers) {
		    page.layers.entries().forEach(function(l) {
			var layerName = l.key.slice(layerPrefix.length);
			var layer = layers.get(layerName);
			
			layer.setOpacity(l.value.opacity);
		    });
		}

		if (page.selection) {
		    selection.select(
			findShapesByName(
			    d3.set(
				page.selection.map(function(s) {
				    return s.selection;
				}))));
		}

		if (page.sort) {
		    page.sort.forEach(function(s) {
			worksheet.sortProperty(s.sort, true);
			if (s.reverse) {
			    // Additional sort on the same property reverses it.
			    worksheet.sortPropert(s.sort, true);
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
			name: layerPrefix + layerName + ".json",
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
					layer: layerPrefix + layerName + ".json",
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