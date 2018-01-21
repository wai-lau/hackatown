let KEY = ''
let MAP = null
let MARKERS = {}
let FRONT_END_MARKERS = {}
let MODE = 'marker'

initMap = (markers, key) => {
  KEY = key;
  MAP = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 45.5017, lng: -73.5673},
    zoom: 10
  });
  var iconBase = 'https://maps.google.com/mapfiles/kml/shapes/';
  var icons = {
    parking: {
      icon: iconBase + 'parking_lot_maps.png'
    },
    library: {
      icon: iconBase + 'library_maps.png'
    },
    info: {
      icon: iconBase + 'info-i_maps.png'
    }
  };
  MARKERS = markers;
  addClickListener();
  loadAllMarkers();

  // Initialize polygon list and pushes the initial polygon
  polygonList = [];
  polygonList.push(new PolygonWrapper(MAP));
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

removeMarkerFromBackEnd = (name) => {
  $.ajax({
    url: '/remove_marker/' + KEY,
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({'name':name}),
    success: function(xhr) {
      console.log(name + ' removed.')
    },
    error: function(xhr) {
      console.log(xhr);
    }
  });
}

addClickListener = () => {
  MAP.addListener('click', (e) => {
    if(MODE == 'marker'){
      let name = e.latLng.lat() + '_' + e.latLng.lng();
      placeAndBindMarker(e.latLng, name)
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
    else if(MODE == 'polygon'){
      // Polygon logic for first polygon; draws until state is off
      if (polygonList[polygonList.length-1].state == 'draw'){
        polygonList[polygonList.length-1].addNode(e.latLng);
        polygonList[polygonList.length-1].updatePolygon();

        $.ajax({
          url: '/add_polygon/' + KEY,
          type: 'post',
          dataType: 'json',
          contentType: 'application/json',
          // data: JSON.stringify({'pointList': JSON.stringify(polygonList[0].pointList), 'name':name ,'color':polygonList[0].color}),
          data: JSON.stringify({
            'name':polygonList[polygonList.length-1].name,
            'data':JSON.stringify({'pointList': JSON.stringify(polygonList[0].pointList),
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
    }
  });

  MAP.addListener('rightclick', (e) => {
    let name = Date.now() + Math.random();
    console.log(name);
    if(MODE == 'polygon'){
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
    }
  });
}

placeAndBindMarker = (latLng, name) => {
  let newMarker = new google.maps.Marker({
    position: latLng,
    map: MAP
  });
  FRONT_END_MARKERS[name] = newMarker
  FRONT_END_MARKERS[name].name = name
  bindMarkerEvents(newMarker, name);
}

var bindMarkerEvents = (marker) => {
  google.maps.event.addListener(marker, "rightclick", (e) => {
    var markerId = e.latLng.lat() + '_' + e.latLng.lng();
    var marker = FRONT_END_MARKERS[markerId]; // find marker
    delete FRONT_END_MARKERS[markerId];
    FRONT_END_MARKERS[marker.name] = marker;
    removeMarker(marker); // remove it
  });
};

var removeMarker = (marker) => {
  marker.setMap(null); // set markers setMap to null to remove it from map
  delete FRONT_END_MARKERS[marker.name]; // delete marker instance from markers object
  removeMarkerFromBackEnd(marker.name);
};

loadAllMarkers = () => {
  for (name in MARKERS) {
    loadMarker(MARKERS[name]);
  }
}

pollDirtyBackEnd = () => {
  keys = Object.keys(FRONT_END_MARKERS)
  $.ajax({
    url: '/check_dirty/' + KEY,
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({'keys': keys}),
    success: function (xhr) {
      console.log('clean')
    },
    error: function(xhr) {
      console.error('dirty');
      location.reload();
    }
  });
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
