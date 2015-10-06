"use strict";

/*global module, require*/

module.exports = function(queryString, onSetState, getViewpoint, deserializeViewpoint, errors) {
    onSetState(function() {
	var viewpointJSON = queryString.readParameter('viewpoint');
	if (viewpointJSON) {
	    try {
		deserializeViewpoint(getViewpoint(), JSON.parse(viewpointJSON));
		
	    } catch (e) {
		errors(e);
	    }
	}
    });
};
