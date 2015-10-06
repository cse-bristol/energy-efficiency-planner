"use strict";

/*global module, require, window*/

var d3 = require('d3'),
    viewpointFactory = require('./viewpoint.js');

module.exports = function(map, serializeViewpoint) {
      d3.select(window)
      .on('message', function() {
          if (d3.event.data === 'getViewpoint') {
              var toSave = viewpointFactory();
              toSave.set(
                  map.getCenter(),
                  map.getZoom()
              );
              
              d3.event.source.postMessage(
                  {
                      viewpoint: JSON.stringify(
			  serializeViewpoint(toSave)
		      )
                  },
                  window.location.origin
              );
          }
      });
};
