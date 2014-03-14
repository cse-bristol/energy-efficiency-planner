"use strict";

/*global d3, OpenDataMap*/

if (!OpenDataMap) {
    var OpenDataMap = {};
}

/*
 Maintains a selection list based on events received.
 If the shift key is held down at the time of the event, the selection will be toggled instead.
 Adds and removes the 'selected' class from the selected elements.
 */
OpenDataMap.selection = function(container) {
    var selection = d3.map({});
    var selectionChangedCallbacks = [];
    
    var module = {
	/*
	  Updates the selection with the given d3 event.
	 */
	clickHandler: function(event, index) {
	    
	    var onSelect = function(event, index) {
		var targetElement = d3.event.target;
		var target = d3.select(targetElement);

		var isSelected = target.classed("selected");

		var entering = [];
		var leaving = [];
		
		if (d3.event.shiftKey) {
		    if (isSelected) {
			/* Deselect this element. */
			target.classed("selected", false);
			selection.remove(event.properties.Name);
			leaving.push(targetElement);
		    } else {
			/* Select this element. */
			target.classed("selected", true);
			selection.set(event.properties.Name, targetElement);
			entering.push(targetElement);
		    }
		} else {
		    /* Clear existing selections. */
		    container.selectAll(".selected")
			.classed("selected", false);

		    /* Select the element. */
		    target.classed("selected", true);
		    leaving = selection.values();
		    
		    selection = d3.map({});
		    selection.set(event.properties.Name, targetElement);
		    
		    if (isSelected) {
			/* We're still in the selection. */
			var i = leaving.indexOf(targetElement);
			leaving.splice(i, 1);
		    } else {
			entering.push(targetElement); /* We've been added to the selection. */
		    }
		}

		selectionChangedCallbacks.forEach(function(c){
		    c(d3.selectAll(selection.values()),
		      d3.selectAll(entering),
		      d3.selectAll(leaving));
		});
	    };
	    return onSelect;
	},

	/*
	 The callback will be called with the arguments selection, entering, leaving whenever the selection changes.
	 */
	addCallback : function(callback) {
	    selectionChangedCallbacks.push(callback);
	},

	/*
	 Returns the currently selected elements.
	 */
	current : function(){
	    return d3.selectAll(selection.values());
	}
    };
    
    return module;
};

