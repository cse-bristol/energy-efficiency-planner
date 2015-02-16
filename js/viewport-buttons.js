"use strict";

/*global module, require*/

module.exports = function(setView, getCenter, getZoom, getViewport, makeButton, update) {
    return {
	set: makeButton(
	    "Set Home",
	    function() {
		getViewport().set(
		    getCenter(),
		    getZoom()
		);
	    },
	    {}
	),
	
	get: makeButton(
	    "Go Home",
	    function() {
		var viewport = getViewport();
		
		setView(
		    viewport.coordinates(),
		    viewport.zoom()
		);

		update();
	    },
	    {}
	)
    };
};
