"use strict";

/*global module, require*/

module.exports = function(setView, getCenter, getZoom, getViewport, makeButton, update) {
    return {
	set: makeButton(
	    "Set Home",
	    null,
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
	    null,
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
