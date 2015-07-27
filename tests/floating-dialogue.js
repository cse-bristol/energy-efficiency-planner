"use strict";

/*global require*/

var d3 = require("d3"),
    body = d3.select(document.body),
    dialogue = require("../js/floating-dialogue/floating-dialogue.js"),

    getData = function(id) {
	return data[id];
    },

    update = function() {
	drawing.dialogues(data);
	drawing.buttons(buttonContainers);
	singleDrawing.update();
    };

    var singleFact = dialogue(
    	"single-dialogue",
    	{
    	    reposition: true,
    	    resize: true,
    	    close: true,
    	    sticky: true,
    	    bringToFront: true,
    	    findSpace: true,
    	    lockToScreen: true,
    	    initialVisibility: false
    	}
    ).single(),

    singleDrawing = singleFact.drawing(
    	body,
    	function(dialogues, newDialogues) {
    	    newDialogues
		.append("span")
    		.text("Single Dialogue");
    	},
    	body,
    	function(buttons, newButtons) {
    	    newButtons
    		.text("Open/Close Button for single dialogue");
    	}
    ),

    fact = dialogue(
	"demo-dialogue",
	{
	    reposition: true,
	    close: true,
	    resize: true,
	    sticky: true,
	    bringToFront: true,
	    findSpace: true,
	    lockToScreen: true
	}
    ),

    drawing = fact.drawing(
	getData,
	body,
	function(dialogues, newDialogues) {
	    newDialogues
		.append("span")
		.text(function(d, i) {
		return "Multi dialogue " + i;
	    });
	},
	function(buttons, newButtons) {
	    newButtons
		.text(function(d, i) {
		    return "Open/Close Button " + d.id;
		});
	},
	function(parentDatum) {
	    return parentDatum;
	}
    ),

    data = [
	fact.deserialize({
	    id: 0,
	    size: [200, 200],
	    visible: true
	}),
	fact.deserialize({
	    id: 1,
	    size: [200, 100],
	    visible: true
	}),
	fact.deserialize({
	    id: 2,
	    // This dialogue is sized such that it should be laid out in a different direction to the others.
	    size: [window.innerWidth - 100, 200],
	    visible: true
	})
	
    ],

    buttonList = body.append("div")
	.attr("id", "button-list"),

    buttonContainers = buttonList.selectAll("div.button")
	.data(data);

buttonContainers.enter().append("div")
    .classed("button", true);

body.append("div")
    .attr("id", "redraw")
    .classed("open-button", true)
    .text("Redraw")
    .on("click", update);

singleFact.load({
    size: [300, 300],
    position: [window.innerWidth, window.innerHeight]
});

singleFact.load(
    singleFact.save()
);

update();
