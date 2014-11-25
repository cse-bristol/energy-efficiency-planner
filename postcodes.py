from os import path, makedirs
from zipfile import ZipFile
from shutil import rmtree
from csv import reader
from json import dumps

from scipy.spatial import Voronoi
from numpy import array
from pyproj import transform, Proj

# Depends on Python 3, scipy (0.12 or later), numpy and pyproj

latLong = Proj("+init=EPSG:4326")
osMap = Proj("+init=EPSG:27700")

class PostCode:
    def __init__(self, code, east, north):
        self.code = code
        self.east = east
        self.north = north

def jsonHead(f):
    f.write('''{
        "type": "FeatureCollection",
        "crs": {
            "type": "name",
            "properties": {
                "name" : "urn:ogc:def:crs:EPSG:27700"
            }
        },

        "features": [
    ''')
    
def jsonFoot(f):
    f.write("]}")
    
    
def json(voronoi, f, first=False):
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

    for (postcode, polygon) in voronoi:
        if first:
            first = False
            f.write(dumps(feature(postcode, polygon)))
        else :
            f.write("," + dumps(feature(postcode, polygon)))

      
def voronoi(postcodes, lsoa):
    "Coverts the postcodes contained within an LSOA into a lookup from postcode to a polygon of coordinates. See http://docs.scipy.org/doc/scipy/reference/tutorial/spatial.html"

    def polygon(region, points):
        def getPoint(points, p):
            "Handles infinite points (badly at present), and recodes the point to use spherical lat/long coordinates."
            if p < 0:
                return transform(osMap, latLong, 0, 0)
            else:
                return transform(osMap, latLong, points[p][0], points[p][1])

        return [getPoint(points, p) for p in region]
            

    points = array([[p.east, p.north] for p in postcodes])

    try:
        v = Voronoi(points)
        vertices = v.vertices
        return [(p, polygon(r, vertices)) for p, r in zip(postcodes, v.regions)]
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
                    
    print(str(len(byLSOA.keys())) + " LSOAs containing " + str(succeeded) + " postcodes.")
    print("Postcodes failed due to missing northing or easting: " + str(failed))

    return byLSOA
