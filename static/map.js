let KEY = ''
let MAP = null
let MARKERS = {}
let STATE = 'polygon'

initMap = (markers, key) => {
  KEY = key;
  MAP = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 45.5017, lng: -73.5673},
    zoom: 10
  });
  MARKERS = markers;
  addClickListener();
  loadAllMarkers();

  // Initialize polygon list and pushes the initial polygon
  polygonList = [];
  polygonList.push(new PolygonWrapper(MAP));
   //setInterval(() => { alert("Hello"); }, 3000);
}

addClickListener = () => {
  MAP.addListener('click', (e) => {
    let name = Date.now() + Math.random();
    console.log(name)
    if(STATE == 'marker'){
      placeMarkerAndPanTo(e.latLng, MAP);
      $.ajax({
        url: '/add_marker/' + KEY,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({'latLng': JSON.stringify(e.latLng), 'name':name}),
        success: function (xhr) {
          MARKERS[name] = {'position': JSON.stringify(e.latLng)}
          console.log(MARKERS)
        },
        error: function(xhr) {
          console.log(xhr);
        }
      });
    }
    else if(STATE == 'polygon'){
      // Polygon logic for first polygon; draws until state is off
      if (polygonList[0].state == 'draw'){
        polygonList[0].addNode(e.latLng);
        polygonList[0].updatePolygon();

        $.ajax({
          url: '/add_polygon/' + KEY,
          type: 'post',
          dataType: 'json',
          contentType: 'application/json',
          data: JSON.stringify({'latLng': JSON.stringify(polygonList[0].pointList), 'name':name ,'color':polygonList[0].color}),
          success: function (xhr) {
            console.log(xhr)
          },
          error: function(xhr) {
            console.error(xhr);
          }
        });
      }
    }
  });

  MAP.addListener('rightclick', (e) => {
    let name = Date.now() + Math.random();
    console.log(name);
    if(STATE == 'polygon'){
      // Make new polygon wrapper
      polygonList.push(new PolygonWrapper(MAP));
      // Locks previous polygon from left click draw
      polygonList[polygonList.length-2].state = 'locked';

      $.ajax({
        url: '/add_polygon/' + KEY,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({'latLng': JSON.stringify(polygonList[polygonList.length-1].pointList), 'name':name, 'color':polygonList[0].color}),
        success: function (xhr) {
          console.log(xhr)
        },
        error: function(xhr) {
          console.error(xhr);
        }
      });
    }
  });
}

loadAllMarkers = () => {
  for (name in MARKERS) {
    loadMarker(MARKERS[name]);
  }
}

loadMarker = (marker) => {
  let newMarker = new google.maps.Marker({
    position: marker['position'],
    map: MAP
  });
}

function placeMarkerAndPanTo(latLng, MAP) {
    var marker = new google.maps.Marker({
      position: latLng,
      map: MAP
    });
    //map.panTo(latLng);
}
