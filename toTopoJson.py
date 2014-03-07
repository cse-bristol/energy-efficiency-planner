from os import listdir, path, makedirs, getenv, remove
from zipfile import ZipFile
from subprocess import call, check_output
from shutil import rmtree
from itertools import chain
from re import compile
from json import dump

import postcodes

# Run this script with Python 3.

# Depends on topoJSON being installed, see: https://github.com/mbostock/topojson/wiki/Installation
# This in turn depends on Python 2.7 being installed and on the path.

# Depends on ogr2ogr being installed and the GDAL_DATA environment variable being set.

inDir = "./data/geometry"
tempDir = "./temp"
outDir = "./data/processed"
manifestFile = outDir + "/manifest.json"
outFile = outDir + "/merged.json"
topoJson = "topojson"
ogr2ogr = "ogr2ogr"
ogrinfo = "ogrinfo"
simplify = 0.5;

def sphericalGeoJSON(inputPath, outPath):
    geoJSON(inputPath, outPath, "EPSG:4326") # Lat and Long

def flatGeoJSON(inputPath, outPath):
    geoJSON(inputPath, outPath, "EPSG:27700") # OS Map

def geoJSON(inputPath, outPath, targetSpatialReferenceSystem):
    args = [ogr2ogr, "-t_srs", targetSpatialReferenceSystem, "-f", "GeoJSON", outPath, inputPath]
    call(args)

def handleZip(geometry, name, inFile):
    z = ZipFile(inFile, 'r')

    extracted = tempdir + "/" + geometry
    makedirs(extracted)
    z.extractall(extracted)
    return loadgeometry(geometry, extracted)
    

ogrinfoPattern = compile(r"\d+: (.*) \(\w+\)")
def handleShp(geometry, name, inFile):
    outFile = tempDir + "/" + geometry + ".json"
    sphericalGeoJSON(inFile, outFile)
    return {"shape" : outFile}
 

def handleGeoJSON(geometry, name, inFile):
    outFile = tempDir + "/" + geometry + ".json"
    sphericalGeoJSON(inFile, outFile)
    return {"shape" : outFile}

def handleTSV(geometry, name, inFile):
    return {name : inFile}

handlers = {
    ".zip": handleZip,
    ".shp": handleShp,
    ".json": handleGeoJSON,
    ".tsv": handleTSV
}

def loadgeometry(geometry, d):
    result = {}
    for f in listdir(d):
        name, ext = path.splitext(f)
        if ext in handlers:
            print("Handling geometry " + geometry + " using " + ext)
            result.update(handlers[ext](geometry, name, d + "/" + f))
    return result


def manifest(processed):
    # Since we've merged all our geometry shapes into one topoJSON file, use that.
    for p in processed.values():
        p['shape'] = outFile

    with open(manifestFile, 'w') as m:
        dump(processed, m)
        

if path.exists(tempDir):
    rmtree(tempDir)
    
makedirs(tempDir)

if not path.exists('./data'):
    makedirs('./data')

processed = { g : loadgeometry(g, inDir + "/" + g) for g in listdir(inDir) }
shapes = [v["shape"] for v in processed.values()]

if processed:
    print("Combining geoJSON files and converting to topoJSON.")
    call([topoJson, '--simplify-proportion', str(simplify), '--properties', '--out', outFile] + shapes)
else:
    print("Failed to import any geometries.")

print("Writing manifest of imported layers.")
manifest(processed)
    
print("Cleaning up temp directory.")
rmtree(tempDir)
