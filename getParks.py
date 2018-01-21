import json

def getParks():
    ''' Get parks from a .geojson file
        Outputs a list of dictionaries with properties of each park
    '''

    myfile = open('mobilierurbaingp.geojson', 'rt')
    data = json.load(myfile,encoding="ISO-8859-1")

    parks = []
    currNames = []
    for entry in data['features']:
        name = entry['properties']['Nom_parc']
        if name is not None:
            name = name.capitalize()
            # Take only one entry from each park
            if not name in currNames:
                # Add name of park to list of current names
                currNames.append(name)
                address = ''
                coordinates = tuple(entry['geometry']['coordinates'])
                parks.append({'address': address, 'name': name, 'coordinates': coordinates})
                # print(type(name))
    return parks
