"use strict";

/*global module, require*/

var input = document.createElement("input");

/*
 Some noddy feature detection for browser compatibility.

 If I have to use this a lot, I should use a library for this instead.
 */
module.exports = {
    input: {
	colour: function() {
	    input.setAttribute("type", "color");
	    return input.type !== "text";
	}()
    }
};
