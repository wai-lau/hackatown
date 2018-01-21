let KEY = ''
let MAP = null
let MARKERS = {}
let FRONT_END_MARKERS = {}
let MODE = 'polygon'
let CLICK_LISTENER = null;
let RIGHTCLICK_LISTENER = null;
let POLYGON_LIST = [];
initMap = (markers, key) => {
  KEY = key;
  MAP = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 45.5017, lng: -73.5673},
    zoom: 10,
    disableDoubleClickZoom: true
  });
  MARKERS = markers;
  addMarkerListener();
  loadAllMarkers();
  loadAllPolygons();

  // Initialize polygon list and pushes the initial polygon
  POLYGON_LIST.push(new PolygonWrapper(MAP));
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
  console.log(POLYGON_LIST);
  CLICK_LISTENER = MAP.addListener('click', (e) => {
    // Polygon logic for first polygon; draws until state is off
    if (POLYGON_LIST[POLYGON_LIST.length-1].state == 'draw'){
      POLYGON_LIST[POLYGON_LIST.length-1].addNode(e.latLng);
      POLYGON_LIST[POLYGON_LIST.length-1].updatePolygon();

      $.ajax({
        url: '/add_polygon/' + KEY,
        type: 'post',
        dataType: 'json',
        contentType: 'application/json',
        data: JSON.stringify({
          'name':POLYGON_LIST[POLYGON_LIST.length-1].name,
          'data':JSON.stringify({'pointList': JSON.stringify(POLYGON_LIST[POLYGON_LIST.length-1].pointList),
          'color':POLYGON_LIST[POLYGON_LIST.length-1].color,
          'state':POLYGON_LIST[POLYGON_LIST.length-1].state})}),
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
    POLYGON_LIST.push(new PolygonWrapper(MAP));
    // Locks previous polygon from left click draw
    POLYGON_LIST[POLYGON_LIST.length-2].state = 'locked';

    $.ajax({
      url: '/add_polygon/' + KEY,
      type: 'post',
      dataType: 'json',
      contentType: 'application/json',
      data: JSON.stringify({
        'name':POLYGON_LIST[POLYGON_LIST.length-1].name,
        'data':JSON.stringify({'pointList': JSON.stringify(POLYGON_LIST[POLYGON_LIST.length-1].pointList),
        'color':POLYGON_LIST[POLYGON_LIST.length-1].color,
        'state':POLYGON_LIST[POLYGON_LIST.length-1].state})}),
      success: function (xhr) {
        console.log(xhr)
      },
      error: function(xhr) {
        console.error(xhr);
      }
    });
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

removeMarkerWithName = (name) => {
  FRONT_END_MARKERS[name].setMap(null); // set markers setMap to null to remove it from map
  delete FRONT_END_MARKERS[name]; // delete marker instance from markers object
}

removeMarker = (marker) => {
  marker.setMap(null); // set markers setMap to null to remove it from map
  delete FRONT_END_MARKERS[marker.name]; // delete marker instance from markers object
  removeMarkerFromBackEnd(marker.name);
};

loadAllMarkers = () => {
  for (name in MARKERS) {
    placeAndBindMarker(MARKERS[name]['position'], name);
  }
}

loadAllPolygons = () => {
  for (let p in POLYGON_LIST){
    p.updatePolygon();
  }
}

pollDirtyBackEnd = () => {
  keys = Object.keys(FRONT_END_MARKERS);
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
      let markers = xhr['responseJSON']['markers'];
      MARKERS = JSON.parse(markers);
      let deletes = JSON.parse(xhr['responseJSON']['deletes']);
      console.log(deletes)
      for(let i = 0; i < deletes.length; i++){
        removeMarkerWithName(deletes[i])
      }
      loadAllMarkers();
    }
  });
}

pollDirtyPolygon = () => {
  polyKeys = POLYGON_LIST.map((polygon) => {
    return polygon.name}
  )
  $.ajax({
    url: '/check_polygon_dirty/' + KEY,
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    data: JSON.stringify({'pKeys': polyKeys}),
    success: function (xhr) {
      console.log('clean')
    },
    error: function(xhr) {
      console.error('dirty');
      //location.reload();
    }
  });
}

function placeMarkerAndPanTo(latLng, MAP) {
    var marker = new google.maps.Marker({
      position: latLng,
      map: MAP
    });
    //map.panTo(latLng);
}

function copyUrlToClipboard () {
  var doc = document;

  // Create temp element
  var textarea = doc.createElement('textarea');
  textarea.style.position = 'absolute';
  textarea.style.opacity = '0';
  textarea.textContent = window.location.href;

  doc.body.appendChild(textarea);

  textarea.focus();
  textarea.setSelectionRange(0, textarea.value.length);

  // copy the selection
  var success;
  try {
          success = doc.execCommand("copy");
  } catch(e) {
          success = false;
  }

  textarea.remove();
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

function copyUrlToClipboard () {
  var doc = document;
  // Create temp element
  var textarea = doc.createElement('textarea');
  textarea.style.position = 'absolute';
  textarea.style.opacity = '0';
  textarea.textContent = window.location.href;
  doc.body.appendChild(textarea);
  textarea.focus();
  textarea.setSelectionRange(0, textarea.value.length);
  // copy the selection
  var success;
  try {
    success = doc.execCommand("copy");
  } catch(e) {
    success = false;
  }
  textarea.remove();
}
