import json
import md5
import random
import datetime
from flask import Flask, render_template, request

app = Flask(__name__)
hash_data = {"asdf":{}}

@app.route('/group/<key>')
def group(key):
    api_key = 'AIzaSyAl-P2j3M-a-IjP7Vfkp_ChinCQMTsb__0'
    if key not in hash_data:
        hash_data[key] = {}
    markers = hash_data[key]
    return render_template("map.html", message="",
                           api_key=api_key,
                           markers=markers,
                           key=key)
        
@app.route('/')
def main():
    api_key = 'AIzaSyAl-P2j3M-a-IjP7Vfkp_ChinCQMTsb__0'
    return render_template("main.html", message="", api_key=api_key)

@app.route('/add_marker/<key>', methods=['POST'])
def add_marker(key):
    lat_lng_json = request.get_json()['latLng']
    name = request.get_json()['name']
    hash_data[key][name] = {'position':json.loads(lat_lng_json)}
    return json.dumps({'success':True}), 200, {'ContentType':'application/json'}

@app.route('/create_group')
def create_group():
    # Create group hash here
    now = datetime.datetime.now()
    rand = random.random()
    m = md5.new()
    m.update(str(now)+str(rand))
    key = m.hexdigest().encode('utf-8').strip()
    return json.dumps({'success':True, 'key': key}), 200, {'ContentType':'application/json'}
