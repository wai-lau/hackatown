class PolygonWrapper {
  constructor(map) {
    this.pointList = [];
    this.state = 'draw';
    this.polygon = null;
    this.map = map;
    this.color = '#FF00FF';
    this.name = Date.now() + Math.random();
  }


  kill() {
  	// Send polygon to the void
  	if (this.polygon)
    	this.polygon.setMap(null);
  }

  addNode(newNode){
  	this.pointList.push(newNode);
  }

  resetPointList(){
  	this.pointList = [];
  }

	updatePolygon() {
    // Destroy previous polygon
    this.kill();

    // Draw polygon
    this.polygon = new google.maps.Polygon({
      paths: this.pointList,
      strokeColor: this.color,
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: this.color,
      fillOpacity: 0.25,
      draggable: true
    });

    this.polygon.addListener('rightclick', () => {if (this.polygon)
      this.kill();
      this.resetPointList();
      this.state = 'deleted';
      });

    // Place on map
    this.polygon.setMap(this.map);
  }
}
