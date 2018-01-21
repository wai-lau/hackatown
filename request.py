from flask import Flask, render_template, request
import json

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


@app.route('/create_group/<key>', methods=['POST'])
def create_group(key):
    print(hash_data)
    if key not in hash_data:
        hash_data[key] = {}
        return json.dumps({'success':True}), 200, {'ContentType':'application/json'}
    else:
        return json.dumps({'success':False}), 500, {'ContentType':'application/json'}
