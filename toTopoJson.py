from os import listdir, path, makedirs
from zipfile import ZipFile
from subprocess import call
from shutil import rmtree

# Depends on topoJSON being installed, see: https://github.com/mbostock/topojson/wiki/Installation

inDir = "~/Dropbox/CSE/Data"
tempDir = "./temp"
outDir = "./data"
topoJson = "C:/node_modules/.bin/topojson.cmd"

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

            shpFilePath = tempDir + "/" + shpFile
            outFilePath = outDir + "/" + name + ".json"
            call([topoJson, shpFilePath, '--out', outFilePath])
        except KeyError as e:
            print("Failed to convert to topojson: " + file + " error: " + e.message)

rmtree(tempDir)
