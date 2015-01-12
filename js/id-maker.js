"use strict";

/*global module, require*/

var a = 'a'.charCodeAt(0),
    z = 'z'.charCodeAt(0),

    /*
     Adapted from the CSS Grammar http://www.w3.org/TR/CSS21/grammar.html#scanner
     */
    nonascii =/[\240-\377]/,
    unicode = /\\{h}{1,6}(\r\n|[ \t\r\n\f])?/,    
    escape = new RegExp(unicode.source + "|" + "\\[^\r\n\f0-9a-f]"),
    nmstart = new RegExp("[_a-z]" + "|" + nonascii.source + "|" + escape.source),
    nmchar = new RegExp("[_a-z0-9-" + "|" + nonascii.source + "|" + escape.source),

    /*
     Greedily natch as many hyphens as we can in a row.
     */
    collapseHyphens = new RegExp("-+", "g");

/*
 Make valid HTML ids from arbitrary strings.
 */
module.exports =  {
    /*
     Add a letter to a string if it is empty of ends with 'Z'.

     Otherwise, increment the letter at the end of the string.

     This is obviously not a good wait to do it.
     */
    increment: function(n) {
	var accum = function(n, acc) {
	    if (n.length === 0) {
		return acc + "A";
	    } 

	    var len = n.length,
		head = n.slice(0, len - 1),
		tail = n[len - 1],
		tailCode = tail.charCodeAt(0);

	    if (tailCode < a || tailCode >= z) {
		return accum(head, "a" + acc);
	    } else {
		var replacement = String.fromCharCode(tailCode + 1);
		return head + replacement + acc;
	    }
	};

	return accum(n, "");
    },

    /*
     Lower cases the string, then identifies characters which are invalid in HTML ids and replaces them with '-'.

     Finally, collapses sequences of multiple hyphens into a single hyphen.
     */
    fromString: function(s) {
	s = s.toLowerCase();
	
	var len = s.length,
	    result = [],
	    i = 0;

	/*
	 Identifiers may start with an optional hyphen.
	 */
	if (s[0] === "-") {
	    result.push("-");
	    i = 1;
	}


	/*
	 There are different restrictions on the first character (which possibly follows the optional hyphen).
	 */
	result.push(
	    nmstart.test(s[i]) ?
		s[i]
		: "-"
	);
	
	i++;

	while(i < len) {
	    result.push(
		nmchar.test(s[i]) ?
		    s[i]
		    : "-"
	    );
	    
	    i++;
	}

	return result.join("").replace(collapseHyphens, "-");
    }
};
