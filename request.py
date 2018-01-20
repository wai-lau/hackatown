from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def main():
    message = "WHY WHY MANTI"
    api_key = 'AIzaSyAl-P2j3M-a-IjP7Vfkp_ChinCQMTsb__0'
    return render_template("map.html", message=message, api_key=api_key)
