from os import listdir, path, makedirs, getenv, remove
from zipfile import ZipFile
from subprocess import call
from shutil import rmtree
from json import load

import postcodes

# Depends on topoJSON being installed, see: https://github.com/mbostock/topojson/wiki/Installation
# This in turn depends on Python 2.7 being installed and on the path. Bleh.

# Depends on ogr2ogr being installed and the GDAL_DATA environment variable being set.

inDir = "./data/raw"
tempDir = "./temp"
outDir = "./data"
outFile = outDir + "/merged.json"
topoJson = "topojson"
ogr2ogr = "ogr2ogr"
simplify = 0.5;

def sphericalGeoJSON(inputPath, geoJSONPath):
    geoJSON(inputPath, geoJSONPath, "EPSG:4326")

def flatGeoJSON(inputPath, geoJSONPath):
    geoJSON(inputPath, geoJSONPath, "EPSG:27700") # OS Map

def geoJSON(inputPath, geoJSONPath, targetSpatialReferenceSystem):
    call([ogr2ogr, "-f", "GeoJSON", geoJSONPath, inputPath, "-t_srs", targetSpatialReferenceSystem])

if not path.exists(tempDir):
    makedirs(tempDir)

if not path.exists(outDir):
    makedirs(outDir)

geoJSONFiles = []

for file in listdir(inDir):
    if file.endswith(".zip"):
        zip = ZipFile(inDir + "/" + file, 'r')
        name, ext = path.splitext(file)

        try:
            shpFile = "zipfolder/" + name + ".shp"
            zip.getinfo(shpFile)
            zip.extractall(tempDir)
            
            shpPath = tempDir + "/" + shpFile
            geoJSONPath = tempDir + "/" + name + ".geojson"
            
            if path.exists(geoJSONPath):
                remove(geoJSONPath)

            if name == "Lower_Layer_SOA_2011_EW_Gen_Clip":
                print("Loading LSOA boundaries as OSMap format.")
                flatGeoJSON(shpPath, geoJSONPath)

                with open(geoJSONPath) as f:
                    lsoas = load(f)

                postcodesByLSOA = postcodes.extract(temp = tempDir)

                # TODO match LSOAs to polygons

                print("Creating tesselated postcode regions within LSOA boundaries.")
                postcodeJSON = tempDir + "/postcodes.geojson"
                with open(postcodeJSON, 'w') as f:
                    i = 0
    
                    postcodes.jsonHead(f)
                    for lsoa, pcdList in postcodesByLSOA.items():
                        if pcdList:
                            postcodes.json(postcodes.voronoi(pcdList, lsoa), f, first=(i==0))
                            i += 1
                        else:
                            print("Skipping empty LSOA " + lsoa)
                    postcodes.jsonFoot(f)

                geoJSONFiles.append(postcodeJSON)

                # TODO modify the LSOAs and reproject them as spherical coordinates


            else:
                print("Converting shapefile to spherical coordinates " + shpPath)
                sphericalGeoJSON(shpPath, geoJSONPath)
                geoJSONFiles.append(geoJSONPath)

        except KeyError as e:
            print("Failed to convert to geojson: " + file + " error: " + str(e))

print("Combining geoJSON files and converting to topoJSON.")
call([topoJson, '--simplify-proportion', str(simplify), '--properties', '--out', outFile] + geoJSONFiles)

print("Cleaning up temp directory.")
rmtree(tempDir)
