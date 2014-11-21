"use strict";

/*global module, require*/

var _ = require("lodash"),
    d3 = require("d3"),
    leaflet = require("leaflet"),
    callbackFactory = require("./helpers.js").callbackHandler,
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

module.exports = function(errors, container, toolbar, map, layersControl, layers, tileLayers, title, findShapesByName, redraw) {
    var onSave = callbackFactory(),
	onLoad = callbackFactory();

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
	list = s.list,
	tuple = s.tuple,
	choices = s.choices,

	schema = {
	    layers: multiple({
		layer: fileLink,
		opacity: optional(float(0, 1)),
		colour: text,
		sort: optional(list(tuple(text, choices(["ascending", "descending"])))),
		"⊞": boolean
	    }),
	    builtInOverlays: multiple({
		overlay: text,
		opacity: float(0, 1)
	    }),

	    baseLayer: {
		"base layer": choices(tileLayers.base.keys()),
		opacity: float(0, 1)
	    },

	    selection: multiple({
		selection: text
	    }),
	    selectionPage: {
		"selection page": pageLink
	    },
	    location: {
		coordinates: tuple(float(), float()),
		zoom: float()
	    },
	    tools: {
		"W": boolean,
		"!": boolean,
		"⌛": boolean,
		"L": boolean
	    }
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
			    layersControl.setShapeOverlayOpacity(layer, l.get("opacity"));
			    layer.worksheet.baseColour(l.get("colour"));
			    if (l.get("⊞")) {
				layer.resultsTable.dialogue().show();				
			    }

			    if (l.has("sort")) {
				l.get("sort").forEach(function(s) {
				    layer.worksheet.sortProperty(s[0], true);
				    if (s[1] === "descending") {
					// set it a second time to reverse
					layer.worksheet.sortProperty(s[0], true);					
				    }
				});
			    }
			});
		    }

		    if (loaded.has("builtInOverlays")) {
			loaded.get("builtInOverlays").forEach(function(overlay) {
			    var layer = tileLayers.overlays.get(
				overlay.get("overlay"));
			    layersControl.setTileOverlayOpacity(layer, overlay.get("opacity"));
			});
		    }

		    if (loaded.has("baseLayer")) {
			var base = loaded.get("baseLayer"),
			    name = base.get("base layer"),
			    layer = tileLayers.base.get(name);

			layersControl.baseLayer(name);
			layersControl.setBaseOpacity(layer, base.get("opacity"));
		    }

		    if (loaded.has("location")) {
			var location = loaded.get("location"),
			    coords = location.get("coordinates");
			
			map.setView(
			    leaflet.latLng(coords[0], coords[1]),
			    location.get("zoom"),
			    {
				animate: false
			    }
			);
		    }

		    if (loaded.has("tools")) {
			var tools = loaded.get("tools"),
			    buttons = d3.selectAll(".open-button");

			buttons.each(function(d, i) {
			    if (tools.has(this.innerHTML)) {
				d3.select(this).classed("element-visible", tools.get(this.innerHTML));
			    }
			});
		    }
		});

		title.title(mapName(page));

		onLoad();

		redraw();
	    },
	    errors.warnUser
	);
    },

	saveTools = function() {
	    var result = {};

	    d3.selectAll(".open-button").each(function(d, i) {
		result[this.innerHTML] = d3.select(this).classed("element-visible");
	    });
	    
	    return result;
	},

	savePages = function() {
	    var mapPage = mapPrefix + title.title(),

		frontPage = {
		    name: mapPage,
		    content: {
			layers: layers.names().map(function(layerName) {
			    var l = layers.get(layerName),
				sort = l.worksheet.getSortProperties();

			    var page = {
				layer: layerPrefix + layerName + layerFileExt,
				opacity: l.options.opacity,
				colour: l.worksheet.baseColour(),
				"⊞": l.resultsTable.dialogue().visible()
			    };

			    if (sort.properties.length > 0) {
				page.sort = _.zip(sort.properties, sort.reverse.map(function(reverse) {
				    return reverse ? "descending" : "ascending";
				}));
			    }

			    return page;
			}),

			builtInOverlays: tileLayers.overlays.entries().map(function(e) {
			    var layer = e.value;
			    return {
				overlay: e.key,
				opacity: layer.options.opacity
			    };
			}),

			baseLayer: {
			    "base layer": layersControl.baseLayer().name(),
			    opacity: layersControl.baseLayer().options.opacity
			},

			location: {
			    coordinates: [
				map.getCenter().lat,
				map.getCenter().lng
			    ],
			    zoom: map.getZoom()
			},			

			tools: saveTools()
		    }
		},
		data = [frontPage];

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
		    function(message) {
			onSave();
			errors.informUser(message);
		    },
		    errors.warnUser
		);
	    },
	    wikiLoad,
	    errors.informUser,
	    function() {
		return "Map of " + title.title();
	    }
	);

    title.onChange(function(title) {
	display.wikiPage(mapPrefix + title);
    });
    display.wikiPage(mapPrefix + title.title());

    return {
	loadPage: function(page) {
	    wikiLoad(page);
	}, 
	onSave: onSave.add,
	onLoad: onLoad.add
    };
};
