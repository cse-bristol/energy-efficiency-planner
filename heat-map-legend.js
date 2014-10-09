"use strict";

/*global module, require*/

var d3 = require("d3"),
    legend = d3.map({
	"#000000": "unknown",
	"#0038a8":"",
	"#0088ce":"",
	"#008c82":"",
	"#009e60":"",
	"#5bbf21":"",
	"#bad80a":"",
	"#f9e300":"",
	"#fca311":"",
	"#f96302":"",
	"#ff4b01":"",
	"#ff3c01":"",
	"#ff0000":"",
	"#c10000":""
    });

module.exports = function(colour) {
    return legend.get(colour.toString());
};
