"use strict";

/*global module*/

/*
 It was originally intended to show what operations were applied to which data, but at present just lists what data is loaded and where it came form. 

 It will need a redesign as we put in calculations for various forms of energy saving or generating technology.
 */
module.exports = function(container) {
    var ul = container.append("ul");
    
    return {
	update : function(sources) {
	    var li = ul.selectAll("li").data(sources);
	    li.exit().remove();
	    li.enter().append("li");
	    li.html(function(s){
		return s.name();
	    });
	}
    };
};
