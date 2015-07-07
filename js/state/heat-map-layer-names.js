"use strict";

/*global module, require*/

var idMaker = require("../id-maker.js"),
    idFromString = idMaker.fromString;

module.exports = [
    "Total Heat Density",
    "Public Buildings Heat Density",
    "Commercial Heat Density",
    "Industrial Heat Density",
    "Residential Heat Density"
].map(idFromString);
