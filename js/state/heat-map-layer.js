"use strict";

/*global module, require*/

var leaflet = require("leaflet"),
    heatMapLegendFactory = require("./heat-map-legend.js");

module.exports = function(getZoom, errors) {
    var makeHeatMapLegend = heatMapLegendFactory(getZoom, errors);
    
    return function(layerName) {
	var baseUrl = "http://test-tiles.0d9303a4.cdn.memsites.com/" + layerName,
	
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
	layer.legend = makeHeatMapLegend(layerName, baseUrl);

	return layer;
    };
};
