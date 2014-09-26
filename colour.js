"use strict";

/*global module, require*/

var d3 = require("d3"),
    blank = "#D0D0D0";

var scale = function(data, colour) {
    var numeric = [];
    var len = data.length;
    for (var i = 0; i < len; i++) {
	var r = parseFloat(data[i]);
	if (data[i] && isNaN(r)) {
	    return d3.scale.category20();
	} else {
	    numeric.push(r);
	}
    }
    
    return d3.scale.linear()
	.domain([d3.min(numeric), d3.max(numeric)])
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

module.exports = {
    scale: scale,
    reverse: reverse
};