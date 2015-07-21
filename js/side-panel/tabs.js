"use strict";

/*global module, require*/

var d3 = require("d3");

module.exports = function(container, tabNames, defaultTab, errors) {
    var currentTab = defaultTab,
	tabNamesSet = d3.set(tabNames),
	tabsContainer = container.append("div")
	    .classed("tabs", true),

	tabsContentContainer = container.append("div")
	    .classed("tab-contents", true),

	isCurrentTab = function(t) {
	    return currentTab === t;
	},

	tabId = function(tabName) {
	    return tabName + "-tab";
	},

	tabContentId = function(tabName) {
	    return tabName + "-tab-content";
	},

	update = function() {
	    var tabs = tabsContainer.selectAll(".tab")
		    .data(tabNames);

	    tabs.exit().remove();
	    
	    tabs.enter().append("span")
		.classed("tab", true)
	    	.attr("id", tabId)
		.text(function(d, i) {
		    return d;
		})
		.on("click", function(d, i) {
		    currentTab = d;
		    update();
		});

	    tabs.classed("enabled", isCurrentTab);

	    var tabsContent = tabsContentContainer.selectAll(".tab-content")
		    .data(tabNames);

	    tabsContent.exit().remove();

	    tabsContent.enter().append("div")
		.classed("tab-content", true)
		.attr("id", tabContentId);

	    tabsContent.classed("enabled", isCurrentTab);
	};

    update();
    
    return {
	getCurrentTab: function() {
	    return currentTab;
	},

	get: function(tabName) {
	    if (!tabNamesSet.has(tabName)) {
		errors.warnUser("Unknown tab " + tabName);
	    }

	    return tabsContentContainer.select("#" + tabContentId(tabName));
	},

	setCurrentTab: function(tab) {
	    if (!tabNamesSet.has(tab)) {
		errors.warnUser("Unknown tab " + tab);
	    }

	    currentTab = tab;
	    update();
	},

	reset: function() {
	    currentTab = defaultTab;
	    update();
	}
    };
};
