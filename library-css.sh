#!/bin/bash

# Fail if attempting to use a variable which hasn't been set.
set -u;
# Stop on first error.
set -e;

# Symlink css files from library into the /libcss folder.

mkdir -p libcss;
ln -s -T ../node_modules/multiuser-file-menu/css libcss/multiuser-file-menu;
ln -s -T ../node_modules/leaflet/dist/leaflet.css libcss/leaflet.css;
ln -s -T ../node_modules/leaflet-control-geocoder/Control.Geocoder.css libcss/leaflet-control-geocoder.css;
ln -s -T ../node_modules/leaflet-zoombox/L.Control.ZoomBox.css libcss/leaflet-zoombox.css;
