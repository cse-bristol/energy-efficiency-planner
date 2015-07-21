"use strict";

/*global module, require*/

var d3 = require("d3"),
    /* 
     Regex to extract the name of final the projected coordinate system.
     See: http://www.geoapi.org/3.0/javadoc/org/opengis/referencing/doc-files/WKT.html
     */
    matchPROJCS = /PROJCS\["(.*?)"/,
    highlightClass = "highlight",

    maxOptions = 10;

/*
 Makes a list of SRIDs which matcha a search term.
 */
module.exports = function(container, errors) {
    var lastSearch,
	results = container.append("select")
	    .classed("srid-search-results", true),
    
	getHighlightIndex = function() {
	    var option = results.selectAll("option"),
		index;

	    option.each(function(d, i) {
		if (d3.select(this).classed(highlightClass)) {
		    index = i;
		}
	    });

	    return index;
	},

	displayResults = function(json, callback) {
	    var options = results.selectAll("option")
		    .data(
			json,
			function(d, i) {
			    return d.doc.srid;
			}
		    );

	    options.enter()
		.append("option")
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
		    results.classed("enabled", false);
		    callback(d.doc);
		});

	    options.exit().remove();

	    options.transition()
		.sort(function(d, i) {
		    return d.score;
		});
	    
	    results
		.classed("enabled", !!json.length)
		.attr("size", Math.min(json.length, maxOptions));

	    var highlightIndex = getHighlightIndex();

	    if (highlightIndex === undefined && options.size() > 0) {
		d3.select(options[0][0]).classed(highlightClass, true);
	    }
	},

	moveHighlight = function(offset) {
	    var options = results.selectAll("options"),
		currentI = getHighlightIndex(),
		newI = (currentI + offset);

	    if (newI < 0) {
		newI += results.size();
	    }
	    
	    newI %= options.size();

	    if (newI !== currentI) {
		d3.select(
		    options[0][currentI]
		).classed(highlightClass, false);

		d3.select(
		    options[0][newI]
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
	    window.setTimeout(
		function() {
		    results.classed("enabled", false);
		},
		100
	    );
	},
	search: function(term, callback) {
	    lastSearch = term;

	    if (term) {
		d3.json(
	            "/channel/srid-search/" + term,
	            function(error, json) {
			if (lastSearch === term) {
	    		    if (error) {
	    			errors(error.response || error);
	    		    } else {
	    			displayResults(json, callback);
	    		    }
			}
	            }
		);
	    }
	},
	moveHighlight: moveHighlight,
	pickHighlighted: function() {
	    results.select("options." + highlightClass)[0][0]
		.click();
	}
    };
};
