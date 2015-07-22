"use strict";

/*global module, require*/

var d3 = require("d3"),
   
    slideOutFactory = require("./slide-out.js"),
    tabsFactory = require("./tabs.js"),

    allTab = "All",
    activeTab = "Active",
    baseTab = "Base",
    uploadTab = "Upload";

module.exports = function(leftPane, rightPane, onSetState, errors) {
    rightPane.append("h3")
	.text("Layers");

    var slideOut = slideOutFactory(
	leftPane,
	rightPane
	    .classed("layer-control", true),
	"L",
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

    return {
	save: function() {
	    return {
		visible: slideOut.getVisibility(),
		tab: tabs.getCurrentTab()
	    };
	},

	load: function(state) {
	    if (state && state.visible !== undefined) {
		slideOut.setVisibility(state.visible);
	    } else {
		slideOut.reset();
	    }
		
	    if (state && state.tab) {
		tabs.setCurrentTab(state.tab);
	    } else {
		tabs.reset();
	    }
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
	    slideOut.setVisibility(true);
	    tabs.setCurrentTab(uploadTab);
	},

	attach: function(map) {
	    slideOut.attach(map);
	}
    };
};
