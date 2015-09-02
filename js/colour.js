"use strict";

/*global module, require*/

var d3 = require("d3");

var categoricalScale = function(data, colour) {
    var scale = d3.scale.category20();
    scale.isCategorical = true;
    return scale;    
},

    numericScale = function(data, colour) {
	return d3.scale.linear()
	    .domain([d3.min(data), d3.max(data)])
	    .range(["white", colour])
	    .interpolate(d3.interpolateLab);
    };

/*
 Used to make readable foreground colours against a coloured background.
 */
var reverse = function(colour) {
    var rgb = d3.rgb(colour),
	lab = d3.lab(rgb.toString()),
	reverse = d3.lab(lab.l, -lab.a, -lab.b);
    
    return d3.lab((lab.l + 50) % 100, -lab.a, -lab.b);
};

var cyclingColours = d3.scale.category10(),
    colourI = 10;

module.exports = {
    categoricalScale: categoricalScale,
    numericScale: numericScale,
    reverse: reverse,
    next: function() {
	return cyclingColours((colourI++ % 10));
    }
};
