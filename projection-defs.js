"use strict";

/*global module*/

module.exports = function(proj4) {
    proj4.defs["EPSG:3035"] = "+proj=laea +lat_0=52 +lon_0=10 +x_0=4321000 +y_0=3210000 +ellps=GRS80 +units=m +no_defs";
    proj4.defs["EPSG:3042"] = "+proj=utm +zone=30 +ellps=GRS80 +units=m +no_defs";
    proj4.defs["EPSG:4258"] = "+proj=longlat +ellps=GRS80 +no_defs";    
};
