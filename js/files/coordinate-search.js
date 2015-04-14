"use strict";

/*global module, require*/

var d3 = require("d3"),
    /* 
     Regex to extract the name of final the projected coordinate system.
     See: http://www.geoapi.org/3.0/javadoc/org/opengis/referencing/doc-files/WKT.html
     */
    matchPROJCS = /PROJCS\["(.*?)"/;

/*
 Makes a list of SRIDs which matcha a search term.
 */
module.exports = function(container, errors) {
    var lastSearch,
	results = container.append("ul")
	    .classed("srid-search-results", true)
	    .style("position", "fixed")
	    .style("visibility", "hidden"),

	displayResults = function(json, position, callback) {
	    var li = results.selectAll("li")
		    .data(
			json,
			function(d, i) {
			    return d.doc.srid;
			}
		    ),

		newLi = li.enter()
		    .append("li")
		    .classed("srid-search-result", true)
		    .text(function(d, i) {
			var matched = matchPROJCS.exec(d.doc.srtext),
			    srid = "ESPG:" + d.doc.srid;

			if (matched.length > 0) {
			    return srid + " - " + matched[1];
			} else {
			    return srid;
			}
		    })
		    .on("click", function(d, i) {
			results.style("visibility", "hidden");
			callback(d.doc);
		    });

	    li.exit().remove();

	    li.transition()
		.sort(function(d, i) {
		    return d.score;
		});
	    
	    results.style("visibility", "visible")
		.style("left", position[0] + "px")
		.style("top", position[1] + "px");
	};

    /*
     Asks the server for results for a search term.
     
     Displays a list of search results in the position required.
     
     Executes a callback when one is clicked.
     */
    return {
	hide: function() {
	    lastSearch = null;
	    results.transition().delay(100).style("visibility", "hidden");
	},
	search:  function(term, position, callback) {
	    lastSearch = term;

	    d3.json(
	        "/channel/srid-search/" + term,
	        function(error, json) {
	    	    if (error) {
	    		errors(error);
	    	    } else {
	    		if (lastSearch === term) {
	    		    displayResults(json, position, callback);
	    		}
	    	    }
	        }
	    );
	}
    };
};
