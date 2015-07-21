"use strict";

/*global module, require*/

var d3 = require("d3"),
    
    slideOutFactory = require("./slide-out.js"),
    tabsFactory = require("./tabs.js"),

    toolText = "L",

    allTab = "All",
    activeTab = "Active",
    baseTab = "Base",
    uploadTab = "Upload";

module.exports = function(leftPane, rightPane, toolbar, onSetState, errors) {
    rightPane.append("h3")
	.text("Layers");
    
    var slideOut = slideOutFactory(
	leftPane,
	rightPane
	    .attr("id", "layer-control"),
	toolbar.append("div")
	    .text(toolText),
	false
    ),

	tabs = tabsFactory(
	    rightPane,
	    [
		allTab,
		activeTab,
		baseTab,
		uploadTab
	    ],
	    activeTab,
	    errors
	);

    onSetState(function(state) {
	if (state.sidePanel) {
	    if (state.sidePanel.visible !== undefined) {
		slideOut.setVisibility(state.sidePanel.visible);
	    } else {
		slideOut.reset();
	    }

	    if (state.sidePanel.tab) {
		tabs.setCurrentTab(state.sidePanel.tab);
	    } else {
		tabs.reset();
	    }
	} else {
	    slideOut.reset();
	    tabs.reset();
	}
    });

    return {
	save: function() {
	    return {
		visible: slideOut.getVisibility(),
		tab: tabs.getCurrentTab()
	    };
	},
	
	all: function() {
	    return tabs.get(allTab);
	},
	
	active: function() {
	    return tabs.get(activeTab);
	},

	base: function() {
	    return tabs.get(baseTab);
	},
	
	upload: function() {
	    return tabs.get(uploadTab);
	},

	focusUpload: function() {
	    return tabs.setCurrentTab(uploadTab);
	}
    };
};
