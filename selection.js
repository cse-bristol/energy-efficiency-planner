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
    
    var module = {
	/*
	  Makes a handler which will update the selection when it receives d3 events.
	  The listener will be called with currently selected elements.
	 */
	makeClickHandler : function(listener) {
	    
	    var onSelect = function(event, index) {
		var target = d3.select(d3.event.target);

		var isSelected = target.classed("selected");
		
		if (d3.event.shiftKey) {
		    if (isSelected) {
			/* Deselect this element. */
			target.classed("selected", false);
			selection.remove(event.properties.Name);
		    } else {
			/* Select this element. */
			target.classed("selected", true);
			selection.set(event.properties.Name, target);
		    }
		} else {
		    /* Clear existing selections. */
		    container.selectAll(".selected")
			.classed("selected", false);

		    /* Select the element. */
		    target.classed("selected", true);
		    selection = d3.map({});
		    selection.set(event.properties.Name, target);
		}

		listener(selection.values());
	    };
	    return onSelect;
	}
    };
    
    return module;
};

