from os import listdir, path, makedirs, getenv, remove
from zipfile import ZipFile
from subprocess import call
from shutil import rmtree

# Depends on topoJSON being installed, see: https://github.com/mbostock/topojson/wiki/Installation
# This in turn depends on Python 2.7 being installed and on the path. Bleh.

# Depends on ogr2ogr being installed and the GDAL_DATA environment variable being set.

inDir = "./data/raw"
tempDir = "./temp"
outDir = "./data"
topoJson = "C:/node_modules/.bin/topojson.cmd"
ogr2ogr = "ogr2ogr"
simplify = 0.5;

latLong = "EPSG:4326"

if not path.exists(tempDir):
    makedirs(tempDir)

if not path.exists(outDir):
    makedirs(outDir)

for file in listdir(inDir):
    if file.endswith(".zip"):
        zip = ZipFile(inDir + "/" + file, 'r')
        name, ext = path.splitext(file)
        try:
            shpFile = "zipfolder/" + name + ".shp"
            zip.getinfo(shpFile)
            zip.extractall(tempDir)
            
            shpPath = tempDir + "/" + shpFile
            geoJSONPath = outDir + "/" + name + ".geojson"
            topoJSONPath = outDir + "/" + name + ".json"
            
            if path.exists(geoJSONPath):
                remove(geoJSONPath)

            call([ogr2ogr, "-f", "GeoJSON", geoJSONPath, shpPath, "-t_srs", latLong])
            call([topoJson, geoJSONPath, '--simplify-proportion', str(simplify), '--properties', '--out', topoJSONPath])

            remove(geoJSONPath)
        except KeyError as e:
            print("Failed to convert to topojson: " + file + " error: " + e.message)

rmtree(tempDir)
