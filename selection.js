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

	  The dataFunction will be used to extract data from the event.

	  The listener will be called with the extracted data for the selection.
	 */
	makeClickHandler : function(listener, dataFunction) {
	    
	    var onSelect = function(event, index) {
		var target = d3.select(this);

		var isSelected = target.classed("selected");
		
		if (d3.event.shiftKey) {
		    if (isSelected) {
			/* Deselect this element. */
			target.classed("selected", false);
			selection.remove(event.properties.Name);
		    } else {
			/* Select this element. */
			target.classed("selected", true);
			selection.set(event.properties.Name, dataFunction(event));
		    }
		} else {
		    /* Clear existing selections. */
		    container.selectAll(".selected")
			.classed("selected", false);

		    /* Select the element. */
		    target.classed("selected", true);
		    selection = d3.map({});
		    selection.set(event.properties.Name, dataFunction(event));
		}

		listener(selection.values());
	    };
	    return onSelect;
	}
    };
    
    return module;
};

