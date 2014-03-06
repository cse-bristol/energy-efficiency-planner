from os import listdir, path, makedirs, getenv, remove
from zipfile import ZipFile
from subprocess import call, check_output
from shutil import rmtree
from itertools import chain
from re import compile

import postcodes

# Run this script with Python 3.

# Depends on topoJSON being installed, see: https://github.com/mbostock/topojson/wiki/Installation
# This in turn depends on Python 2.7 being installed and on the path.

# Depends on ogr2ogr being installed and the GDAL_DATA environment variable being set.

inDir = "./data/geometry"
tempDir = "./temp"
outDir = "./data/processed"
outFile = outDir + "/merged.json"
topoJson = "topojson"
ogr2ogr = "ogr2ogr"
ogrinfo = "ogrinfo"
simplify = 0.5;

def sphericalGeoJSON(inputPath, outPath, layer=None):
    geoJSON(inputPath, outPath, layer, "EPSG:4326") # Lat and Long

def flatGeoJSON(inputPath, outPath, layer=None):
    geoJSON(inputPath, outPath, layer, "EPSG:27700") # OS Map

def geoJSON(inputPath, outPath, layer, targetSpatialReferenceSystem):
    args = [ogr2ogr, "-t_srs", targetSpatialReferenceSystem, "-f", "GeoJSON", outPath, inputPath]

    if layer:
        args.append(layer)

    call(args)

def handleZip(name, inFile):
    z = ZipFile(inFile, 'r')

    extracted = tempdir + "/" + name
    makedirs(extracted)
    z.extractall(extracted)
    return loadgeometry(name, extracted)
    

ogrinfoPattern = compile(r"\d+: (.*) \(\w+\)")
def handleShp(name, inFile):
    def getLayers():
        def parseLine(l):
           m = ogrinfoPattern.match(l)
           if m:
               return m.group(1)

        layers = check_output([ogrinfo, inFile]).decode().split('\n')
        for l in layers:
            parsed = parseLine(l)
            if parsed:
                yield parsed


    def process(l):
        outFile = tempDir + "/" + name + "_" + l + ".json"
        sphericalGeoJSON(inFile, outFile, l)
        return outFile
        
    return [process(l) for l in getLayers()]


def handleGeoJSON(geometryName, inFile):
    outFile = tempDir + "/" + geometryName + ".json"
    sphericalGeoJSON(inFile, outFile)
    return [outFile]

handlers = {
    ".zip": handleZip,
    ".shp": handleShp,
    ".json": handleGeoJSON
}

def loadgeometry(geometry, d):
    for f in listdir(d):
        _, ext = path.splitext(f)
        if ext in handlers:
            print("Handling geometry " + geometry + " as " + ext)
            return handlers[ext](geometry, d + "/" + f)



if path.exists(tempDir):
    rmtree(tempDir)
    
makedirs(tempDir)

if not path.exists('./data'):
    makedirs('./data')

processed = { g : loadgeometry(g, inDir + "/" + g) for g in listdir(inDir) }
geoJSONFiles = list(chain(*processed.values()))

if geoJSONFiles:
    print("Combining geoJSON files and converting to topoJSON.")
    call([topoJson, '--simplify-proportion', str(simplify), '--properties', '--out', outFile] + geoJSONFiles)
else:
    print("Failed to import any geometries.")
    
print("Cleaning up temp directory.")
rmtree(tempDir)
