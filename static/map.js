let KEY = ''
let MAP = null
let MARKERS = {}
let FRONT_END_MARKERS = {}
let MODE = 'polygon'
let CLICK_LISTENER = null;
let RIGHTCLICK_LISTENER = null;

initMap = (markers, key) => {
  KEY = key;
  MAP = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 45.5017, lng: -73.5673},
    zoom: 10,
    gestureHandling: 'none'
  });
  MARKERS = markers;
  addMarkerListener();
  loadAllMarkers();
  // Initialize polygon list and pushes the initial polygon
  polygonList = [];
  polygonList.push(new PolygonWrapper(MAP));
  //setInterval(() => { alert("Hello"); }, 3000);
}

changeMode = (arg) => {
  arg = arg.toUpperCase();
  google.maps.event.removeListener(CLICK_LISTENER);
  google.maps.event.removeListener(RIGHTCLICK_LISTENER);
  if (arg.indexOf('CURSOR') >= 0){
    MODE ='cursor';
  } else if (arg.indexOf('MARKER') >= 0) {
    MODE = 'marker';
    addMarkerListener();
  } else if (arg.indexOf('POLYGON') >= 0) {
    MODE = 'polygon'
    addPolygonListener();
  }
}


sendMarkerToBackEnd = (e, name) => {
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

addMarkerListener = () => {
  CLICK_LISTENER = MAP.addListener('click', (e) => {
    let name = e.latLng.lat() + '_' + e.latLng.lng();
    placeAndBindMarker(e.latLng, name);
    sendMarkerToBackEnd(e, name);
  });
  RIGHTCLICK_LISTENER = MAP.addListener('rightclick', (e) => {
    let name = Date.now() + Math.random();
    console.log(name);
  });
}

addPolygonListener = () => {
  CLICK_LISTENER = MAP.addListener('click', (e) => {
    // Polygon logic for first polygon; draws until state is off
    if (polygonList[polygonList.length-1].state == 'draw'){
      polygonList[polygonList.length-1].addNode(e.latLng);
      polygonList[polygonList.length-1].updatePolygon();

      $.ajax({
        url: '/add_polygon/' + KEY,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({'name':polygonList[polygonList.length-1].name,
                  'data':JSON.stringify({'pointList': JSON.stringify(polygonList[polygonList.length-1].pointList),
                  'color':polygonList[polygonList.length-1].color,
                  'state':polygonList[polygonList.length-1].state})}),
        success: function (xhr) {
          console.log(xhr)
        },
        error: function(xhr) {
          console.error(xhr);
        }
      });
    }
  });
  RIGHTCLICK_LISTENER = MAP.addListener('rightclick', (e) => {
    let name = Date.now() + Math.random();
    console.log(name);
    // Make new polygon wrapper
    polygonList.push(new PolygonWrapper(MAP));
    // Locks previous polygon from left click draw
    polygonList[polygonList.length-2].state = 'locked';

    $.ajax({
      url: '/add_polygon/' + KEY,
      type: 'post',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        'name':polygonList[polygonList.length-1].name,
        'data':JSON.stringify({'pointList': JSON.stringify(polygonList[polygonList.length-1].pointList),
        'color':polygonList[polygonList.length-1].color,
        'state':polygonList[polygonList.length-1].state})}),
      success: function (xhr) {
        console.log(xhr)
      },
      error: function(xhr) {
        console.error(xhr);
      }
    });
  });
}

var bindMarkerEvents = function(marker) {
  google.maps.event.addListener(marker, "rightclick", function (e) {
    var markerId = e.latLng.lat() + '_' + e.latLng.lng(); // get marker id by using clicked point's coordinate
    var marker = FRONT_END_MARKERS[markerId]; // find marker
    removeMarker(marker, markerId); // remove it
  });
};

var removeMarker = function(marker, markerId) {
  marker.setMap(null); // set markers setMap to null to remove it from map
  delete FRONT_END_MARKERS[markerId]; // delete marker instance from markers object
};

loadAllMarkers = () => {
  for (name in MARKERS) {
    placeAndBindMarker(MARKERS[name]['position'], name);
  }
}

placeAndBindMarker = (latLng, name) => {
  let newMarker = new google.maps.Marker({
    position: latLng,
    map: MAP
  });
  FRONT_END_MARKERS[name] = newMarker
  bindMarkerEvents(newMarker, name);
}


loadData = () => {
  $.ajax({
    url: '/load_data',
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    success: function (xhr) {
      console.log(xhr);
      let data = [xhr['shelters'], xhr['parks']];
      populateLoadMarkers(data)
    },
    error: function(xhr) {
      alert('nuh');
      console.log(xhr);
    }
  });
}

populateLoadMarkers = (data) => {
  let newMarker = null;
  let locationData = null;
  let iconType = null;
  for (let dataType in data) {
  	for (let location in data[dataType]){
  		locationData = data[dataType][location];
      iconType = dataType == 0 ? 'https://png.icons8.com/color/50/000000/home.png'
                                  : 'https://png.icons8.com/color/50/000000/deciduous-tree.png'
      newMarker = new google.maps.Marker({
        position: {lat: locationData.coordinates[1], lng: locationData.coordinates[0]},
        map: MAP,
        icon: iconType
      })
    }
  }
}
