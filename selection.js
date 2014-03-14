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

    var changeSelection = function(d3Elements, isModification) {
	var notAlreadySelected = d3Elements.filter(function(d, i){
	    return !this.classList.contains("selected");
	});
	var alreadySelected = d3Elements.filter(function(d, i) {
	    return this.classList.contains("selected");
	});

	var entering = [];
	var leaving = [];

	if (!isModification) {
	    /* Remove elements which were previously selected, but weren't just clicked on. */
	    selection.entries().forEach(function(e){
		if (d3Elements[0].indexOf(e.value) < 0) {
		    selection.remove(e.key);
		    leaving.push(e.value);
		}
	    });
	} else if (notAlreadySelected.empty()) {
	    /* Deselect everything that was just clicked on. */
	    alreadySelected.each(function(d, i){
		leaving.push(this);
		selection.remove(d.properties.Name);
	    });
	}

	d3.selectAll(leaving).classed("selected", false);
	
	notAlreadySelected.classed("selected", true);
	notAlreadySelected.each(function(d, i){
	    entering.push(this);
	    selection.set(d.properties.Name, this);
	});
	
	selectionChangedCallbacks.forEach(function(c){
	    c(selection.values(),
	      entering,
	      leaving);
	});	
    };

    var module = {
	/*
	 Updates the selection with the given d3 event.
	 */
	clickHandler: function(data, index) {
	    changeSelection(d3.select(d3.event.target), d3.event.shiftKey);
	},

	select: function(d3Elements, isModification) {
	    changeSelection(d3Elements, isModification);
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
	    return selection.values();
	}
    };
    
    return module;
};

