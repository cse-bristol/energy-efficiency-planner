from os import path, makedirs
from zipfile import ZipFile
from shutil import rmtree
from csv import reader
from json import dumps

from scipy.spatial import Voronoi
from numpy import array

# Depends on Python 3, scipy and numpy

spatialReferenceSystem = "urn:ogc:def:crs:EPSG:27700"

class PostCode:
    def __init__(self, code, east, north):
        self.code = code
        self.east = east
        self.north = north


def geoJSON(voronoi):
    def feature(postcode, polygon):
        return {
            "type": "Feature",
            "properties": {
                "postcode": postcode.code
                # We could also potentially put in LSOA here when we come to do hierarchies.
            },
            "geometry": {
                "type": "Polygon",
                # Polygons can be comprised of multiple lists of coordinates, so that they may contain holes.
                # Our postcode areas don't contain holes, so just put them in a list by themselves.
                "coordinates": [polygon] 
            }
        }

    return dumps({
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name" : spatialReferenceSystem
            }
        },

        "features": [feature(postcode, polygon) for postcode, polygon in voronoi.items()]
    })

        

def voronoi(postcodes, lsoa):
    "Coverts the postcodes contained within an LSOA into a lookup from postcode to a polygon of coordinates. See http://docs.scipy.org/doc/scipy/reference/tutorial/spatial.html"

    def polygon(region, points):
        def getPoint(points, p):
            if p < 0:
                return [0, 0] # TODO: handle points which represent infinity
            else:
                return points[p].tolist()

        return [getPoint(points, p) for p in region]
            

    points = array([[p.east, p.north] for p in postcodes])

    try:
        v = Voronoi(points)
        vertices = v.vertices
        return {p : polygon(r, vertices) for p, r in zip(postcodes, v.regions)}
    except IndexError:
        print("Failed " + str(points))

    
def extract(temp="./temp", archive="./data/raw/ONSPD_NOV_2013_csv.zip", data="Data/ONSPD_NOV_2013_UK.csv"):
    if not path.exists(temp):
        makedirs(temp)
    
    extracted = temp + "/" + data
    
    ZipFile(archive).extract(data, temp)
    
    byLSOA = {}
    
    with open(extracted) as postcodes:
        csv = reader(postcodes)
        sawHeader = False
    
        succeeded = 0
        failed = 0
        for row in csv:
            if not sawHeader:
                sawHeader = True
                postcode = row.index('pcd')
                lowerSuperOutputArea = row.index('lsoa11') # From 2011
                easting = row.index('oseast1m')
                northing = row.index('osnrth1m')
    
            else:
                lsoa = row[lowerSuperOutputArea]
                if lsoa not in byLSOA:
                    byLSOA[lsoa] = []
                    
                try:
                    e = float(row[easting])
                    n = float(row[northing])
                    byLSOA[lsoa].append(PostCode(row[postcode], e, n))
                    succeeded += 1
                except ValueError as ex:
                    failed += 1
                    
    print("Postcodes categorized by LSOA " + str(succeeded))
    print("Postcodes failed due to missing northing or easting: " + str(failed))

    rmtree(temp)

    return byLSOA

byLSOA = extract()

print("Tesselating postcode areas")
i = 0
for lsoa, postcodes in byLSOA.items():
    if postcodes:
        v = voronoi(postcodes, lsoa)
        geoJSON(v)
        i += 1
else:
        print("Skipping empty LSOA " + lsoa)

print("Finished tesselating " + str(i) + " LSOAs")