##import xml.etree.ElementTree as ET
##tree = ET.parse('mtl_shelters.xml')
##root = tree.getroot()
##
##child = root[0]
##
##for grandchild in child:
##    if 'Folder' in grandchild.tag:
##        folder = grandchild
##        print(1)
##        break
##
##

from fastkml import kml

##with open('mtl_shelters.xml', 'rt', encoding="utf-8") as myfile:
##    # Create the KML object to store the parsed result
##    k = kml.KML()
##    k.from_string(myfile.read())

# If python 2: use the following pls
# Open file for reading
myfile = open('mtl_shelters.xml', 'rt')
# Read in from file
doc = myfile.read()
# Convert Latin-1 encoding to UTF-8
doc.decode('ISO-8859-1').encode('UTF-8')

# If python3: use myfile = open('mtl_shelters.xml', 'rt', encoding='ISO-8859-1')

# Instantiate KML object
k = kml.KML()
# Send string to the KML object
k.from_string(doc)

kdocument = list(k.features())
kfolder = list(kdocument[0].features())
# List of placemarks
kplacemarks = list(kfolder[0].features())
print 'Placemarks parsed'

# Read in the KML string
##k.from_string(doc)
##
### Next we perform some simple sanity checks
##
### Check that the number of features is correct
### This corresponds to the single ``Document``
##>>> features = list(k.features())
##>>> len(features)
##1
##
### Check that we can access the features as a generator
### (The two Placemarks of the Document)
##>>> features[0].features()
##<generator object features at 0x2d7d870>
##>>> f2 = list(features[0].features())
##>>> len(f2)
##2
##
### Check specifics of the first Placemark in the Document
##>>> f2[0]
##<fastkml.kml.Placemark object at 0x2d791d0>
##>>> f2[0].description
##>>> f2[0].name
##'Document Feature 1'
##
### Check specifics of the second Placemark in the Document
##>>> f2[1].name
##'Document Feature 2'
##>>> f2[1].name = "ANOTHER NAME"
##
### Verify that we can print back out the KML object as a string
##>>> print k.to_string(prettyprint=True)
##<kml:kml xmlns:ns0="http://www.opengis.net/kml/2.2">
##  <kml:Document>
##    <kml:name>Document.kml</kml:name>
##    <kml:visibility>1</kml:visibility>
##    <kml:open>1</kml:open>
##    <kml:Style id="exampleStyleDocument">
##      <kml:LabelStyle>
##        <kml:color>ff0000cc</kml:color>
##        <kml:scale>1.0</kml:scale>
##      </kml:LabelStyle>
##    </kml:Style>
##    <kml:Placemark>
##      <kml:name>Document Feature 1</kml:name>
##      <kml:visibility>1</kml:visibility>
##      <kml:open>0</kml:open>
##      <kml:Point>
##        <kml:coordinates>-122.371000,37.816000,0.000000</kml:coordinates>
##      </kml:Point>
##    </kml:Placemark>
##    <kml:Placemark>
##      <kml:name>ANOTHER NAME</kml:name>
##      <kml:visibility>1</kml:visibility>
##      <kml:open>0</kml:open>
##      <kml:Point>
##        <kml:coordinates>-122.370000,37.817000,0.000000</kml:coordinates>
##      </kml:Point>
##    </kml:Placemark>
##  </kml:Document>
##</kml:kml>
