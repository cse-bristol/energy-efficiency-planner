"use strict";

/*global module, require*/

var helpers = require("./helpers.js"),
    callbackFactory = helpers.callbackHandler;

module.exports = function(container) {
    var title = container.append("input")
	.attr("id", "title")
	.on("input", function(d, i) {
	    callback(title.node().value);
	}),
	callback = callbackFactory();

    title.node().value = "My Energy Masterplan";

    return {
	title: function(val) {
	    if (val !== undefined) {
		title.node().value = val;
	    }
	    return title.node().value;
	},
	onChange: function(c) {
	    callback.add(c);
	}
    };
};