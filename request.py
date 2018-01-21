from flask import Flask, render_template


app = Flask(__name__)
hash_data = {"asdf":
                [{
                    'position':{'lat': 45.5017, 'lng': -73.5673},
                    'title':'helpme'
                }]
            }

@app.route('/group/<key>')
def group(key):
    api_key = 'AIzaSyAl-P2j3M-a-IjP7Vfkp_ChinCQMTsb__0'
    if key not in hash_data:
        hash_data[key] = []
    markers = hash_data[key]
    return render_template("map.html", message="",
                           api_key=api_key,
                           markers=markers,
                           key=key)


@app.route('/')
def main():
    return render_template("main.html", message="")

@app.route('/group_request/<key>', methods=['POST'])
def group_request(key):
    print('posted')
