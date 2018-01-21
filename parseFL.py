from fastkml import kml
import re

def getShelters():
    # If python 2: use the following pls
    # Open file for reading
    myfile = open('mtl_shelters.xml', 'rt')
    # Read in from file
    doc = myfile.read()
    # Convert Latin-1 encoding to UTF-8
    doc.decode('ISO-8859-1').encode('UTF-8')

    # If python3: use
    #myfile = open('mtl_shelters.xml', 'rt', encoding='ISO-8859-1')
    #doc = myfile.read()
    # Instantiate KML object
    k = kml.KML()
    # Send string to the KML object
    k.from_string(doc)

    kdocument = list(k.features())
    kfolder = list(kdocument[0].features())
    # List of placemarks
    kplacemarks = list(kfolder[0].features())

    shelters = []

    for placemark in kplacemarks:
        address = re.search('(?<=\<br\/\>).*(?=\<br\/\>)', placemark.description).group(0).strip()
        name = placemark.name
        coordinates = (placemark.geometry.x, placemark.geometry.y)
        shelters.append({'address': address,'name': name,'coordinates': coordinates})

    return shelters
