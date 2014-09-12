"use strict";

/*global module, require*/


module.exports = function(errors, container, buttonContainer) {
var interop = require("gitit-interop")(
    errors, 
    function onWikiSave() {
	// TODO
	// for each layer, get a geojson file and save it as a file

	// parse out:
	// a table containing the selection
	// a table containing links to the layers, with their opacity and enabled
	// sort columns
	// a link
    }, 
    function onWikiLoad(page) {
	// TODO
	// do the opposite
    }),

    parser = interop.parser,
    pageAsMarkdown = parser.pageAsMarkdown,
    multiple = parser.multiple,
    optional = parser.optional,
    boolean = parser.boolean,
    float = parser.float,
    text = parser.text,
    pageLink = parser.pageLink,
    fileLink = parser.fileLink,
    
    display = interop.makeDisplay(container, buttonContainer),

    schema = {
      layers: multiple({
          layer: fileLink,
          opacity: optional(float(0, 1), 1),
          enabled: optional(boolean, true)
      }),
      selection: multiple({
          "selected layer": text,
          "selected id": text
      }),
      sort: multiple({
          sort: text
      })
    };
};