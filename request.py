import json
import md5
import random
import datetime
from flask import Flask, render_template, request
from parseFL import getShelters
from getParks import getParks


app = Flask(__name__)
hash_data = {}
success = json.dumps({'success':True}), 200, {'ContentType':'application/json'}
fail = json.dumps({'success':False}), 500, {'ContentType':'application/json'}
api_key = 'AIzaSyAl-P2j3M-a-IjP7Vfkp_ChinCQMTsb__0'
polygon_hash_data = {}

@app.route('/group/<key>')
def group(key):
    if key not in hash_data:
        return render_template("main.html", message="")
    markers = hash_data[key]
    return render_template("map.html", message="",
                           api_key=api_key,
                           markers=markers,
                           key=key)


@app.route('/')
def main():
    return render_template("main.html", message="")

@app.route('/add_marker/<key>', methods=['POST'])
def add_marker(key):
    print(request.get_json())
    lat_lng_json = request.get_json()['latLng']
    name = request.get_json()['name']
    hash_data[key][name] = {'position':json.loads(lat_lng_json)}
    return success

@app.route('/remove_marker/<key>', methods=['POST'])
def remove_marker(key):
    name = request.get_json()['name']
    if key in hash_data and name in hash_data[key]:
        del hash_data[key][name]
        return success
    return fail

@app.route('/create_group')
def create_group():
    # Create group hash here
    now = datetime.datetime.now()
    rand = random.random()
    m = md5.new()
    m.update(str(now)+str(rand))
    key = m.hexdigest().encode('utf-8').strip()
    hash_data[key] = {}
    return json.dumps({'success':True, 'key': key}), 200, {'ContentType':'application/json'}


@app.route('/check_dirty/<key>', methods=['POST'])
def check_dirty(key):
    keys = request.get_json()['keys']
    clean = True
    dirty = {}
    deletes = []
    for k in keys:
        if k not in hash_data[key]:
            clean = False
            deletes.append(k)
    for n in hash_data[key]:
        if n not in keys:
            clean = False
            dirty[n] = hash_data[key][n]
    if clean:
        return success
    return json.dumps({'success':False, 'markers': json.dumps(dirty), 'deletes': json.dumps(deletes)}), 406, {'ContentType':'application/json'}

@app.route('/check_polygon_dirty/<key>', methods=['POST'])
def check_polygon_dirty(key):
    pKeys = request.get_json()['pKeys']
    print(polygon_hash_data)
    clean = True
    for k in pKeys:
        if k not in polygon_hash_data[key].keys():
            clean = False
            break
    if clean:
        for n in polygon_hash_data[key].keys():
            if n not in pKeys:
                clean = False
                break
    if clean:
        print('clean!!')
        return success
    print('ew dirty')
    return fail

@app.route('/load_data', methods=['POST'])
def load_data():
    shelters = getShelters()
    parks = getParks()
    return json.dumps({'success':True, 'parks': parks, 'shelters': shelters}), 200, {'ContentType':'application/json'}

@app.route('/add_polygon/<key>', methods=['POST'])

def add_polygon(key):
    # Get name (hash ID) of polygon
    name = request.get_json()['name']
    data = request.get_json()['data']
    # ptList_json = request.get_json()['pointList']
    # color = request.get_json()['color']
    if key not in polygon_hash_data:
        polygon_hash_data[key] = {}
    polygon_hash_data[key][name] = data
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
