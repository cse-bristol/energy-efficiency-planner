"use strict";

/*global module, require*/

var d3 = require("d3"),
    _ = require("lodash"),
    leaflet = require("leaflet"),

    legendFactory = require("../../legend/legend-data.js"),

    legendsByName = {
	"total-heat-density": require("./Total Heat Density.json"),
	"public-buildings-heat-density": require("./Public Buildings Heat Density.json"),
	"commercial-heat-density": require("./Commercial Heat Density.json"),
	"industrial-heat-density": require("./Industrial Heat Density.json"),
	"residential-heat-density": require("./Residential Heat Density.json")
    },

    urlsByLayerName = {
	"total-heat-density": "Total Heat Density",
	"public-buildings-heat-density": "Public Buildings Heat Density",
	"commercial-heat-density": "Commercial Heat Density",
	"industrial-heat-density": "Industrial Heat Density",
	"residential-heat-density": "Residential Heat Density"
    },

    maxZoom = 17;

module.exports = {
    layerNames: Object.keys(legendsByName),

    leafletLayers: function(getZoom) {
	var bins = d3.map(),

	    makeLegend = function(layerName, baseUrl) {
		var f = function() {
		    var z = getZoom();

		    z = Math.min(z, maxZoom);
		    z = Math.max(z, 1);

		    return bins.get(layerName)[z - 1];
		};

		f.header = function() {
		    return layerName + ' kWh/m<sup>2</sup>/year';
		};
		
		return f;
	    };

	Object.keys(legendsByName)
	    .forEach(function(layerName) {
		bins.set(
		    layerName,
		    legendsByName[layerName]
			.map(legendFactory.bins)
		);
	    });
	
	return function(layerName) {
	    var baseUrl = "http://test-tiles.0d9303a4.cdn.memsites.com/" + urlsByLayerName[layerName],
		
		layer = leaflet.tileLayer(baseUrl + '/Z{z}/{y}/{x}.png', {
		    attribution: '<a href="http://tools.decc.gov.uk/nationalheatmap/">English National Heat Map</a>,',
		    minZoom: 2,
		    maxZoom: 17,
		    bounds: leaflet.latLngBounds(
			leaflet.latLng(50, -7),
			leaflet.latLng(56, 2)
		    )
		});
	    
	    layer.options.zIndex = 1;
	    layer.legend = makeLegend(layerName, baseUrl);

	    return layer;
	};
    }
};
