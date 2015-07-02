"use strict";

/*global module, require*/

var d3 = require("d3"),
    blank = "#D0D0D0";

var scale = function(data, colour) {
    var numeric = [];
    var len = data.length;
    for (var i = 0; i < len; i++) {
	var d = data[i];

	if (!d) {
	    // Ignore this data point.
	} else {
	    var r = parseFloat(d);

	    if (isNaN(r)) {
		var scale = d3.scale.category20();
		scale.isCategorical = true;
		return scale;
	    } else {
		numeric.push(r);
	    }
	}
    }

    if (!numeric.length) {
	// Can't take min or max of an empty list.
	return d3.scale.category20();
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

var cyclingColours = d3.scale.category10(),
    colourI = 10;

module.exports = {
    scale: scale,
    reverse: reverse,
    next: function() {
	return cyclingColours((colourI++ % 10));
    }
};
