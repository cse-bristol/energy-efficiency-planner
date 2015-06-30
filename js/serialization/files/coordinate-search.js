"use strict";

/*global module, require*/

var d3 = require("d3"),
    /* 
     Regex to extract the name of final the projected coordinate system.
     See: http://www.geoapi.org/3.0/javadoc/org/opengis/referencing/doc-files/WKT.html
     */
    matchPROJCS = /PROJCS\["(.*?)"/,
    highlightClass = "highlight";

/*
 Makes a list of SRIDs which matcha a search term.
 */
module.exports = function(container, errors) {
    var lastSearch,
	results = container.append("ul")
	    .classed("srid-search-results", true)
	    .style("position", "fixed")
	    .style("visibility", "hidden"),

	getHighlightIndex = function() {
	    var li = results.selectAll("li"),
		index;

	    li.each(function(d, i) {
		if (d3.select(this).classed(highlightClass)) {
		    index = i;
		}
	    });

	    return index;
	},

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

			if (matched && matched.length > 0) {
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

	    var highlightIndex = getHighlightIndex();

	    if (highlightIndex === undefined && li.size() > 0) {
		d3.select(li[0][0]).classed(highlightClass, true);
	    }
	},

	moveHighlight = function(offset) {
	    var li = results.selectAll("li"),
		currentI = getHighlightIndex(),
		newI = (currentI + offset);

	    if (newI < 0) {
		newI += results.size();
	    }
	    
	    newI %= li.size();

	    if (newI !== currentI) {
		d3.select(
		    li[0][currentI]
		).classed(highlightClass, false);

		d3.select(
		    li[0][newI]
		).classed(highlightClass, true);
	    }
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
	search: function(term, position, callback) {
	    lastSearch = term;

	    if (term) {
		d3.json(
	            "/channel/srid-search/" + term,
	            function(error, json) {
			if (lastSearch === term) {
	    		    if (error) {
	    			errors(error.response || error);
	    		    } else {
	    			displayResults(json, position, callback);
	    		    }
			}
	            }
		);
	    }
	},
	moveHighlight: moveHighlight,
	pickHighlighted: function() {
	    results.select("li." + highlightClass)[0][0]
		.click();
	}
    };
};
