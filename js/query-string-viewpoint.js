"use strict";

/*global module, require*/

module.exports = function(queryString, onSetState, getViewpoint, deserializeViewpoint, setView, errors) {
    onSetState(function() {
	var viewpointJSON = queryString.readParameter('viewpoint');
	if (viewpointJSON) {
	    try {
		deserializeViewpoint(getViewpoint(), JSON.parse(viewpointJSON));
	    } catch (e) {
		errors(e);
	    }
	}

	setView(
	    getViewpoint().coordinates(),		
	    getViewpoint().zoom()
	);
    });
};
