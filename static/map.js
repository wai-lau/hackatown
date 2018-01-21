let KEY = ''
let MAP = null
let MARKERS = {}
let FRONT_END_MARKERS = {}

initMap = (markers, key) => {
  KEY = key;
  MAP = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 45.5017, lng: -73.5673},
    zoom: 10
  });
  MARKERS = markers;
  addClickListener();
  loadAllMarkers();
   //setInterval(() => { alert("Hello"); }, 3000);
}

addClickListener = () => {
  MAP.addListener('click', (e) => {
    placeMarker(e.latLng);
    let name = e.latLng.lat() + '_' + e.latLng.lng();
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
   });
}

loadAllMarkers = () => {
  for (name in MARKERS) {
    loadMarker(MARKERS[name], name);
  }
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

loadMarker = (marker, name) => {
  let newMarker = new google.maps.Marker({
    position: marker['position'],
    map: MAP
  });
  FRONT_END_MARKERS[name] = newMarker
  bindMarkerEvents(newMarker, name);
}

placeMarker = (latLng) => {
  let markerId = latLng.lat() + '_' + latLng.lng();
  let newMarker = new google.maps.Marker({
    position: latLng,
    map: MAP
  });
  FRONT_END_MARKERS[markerId] = newMarker
  bindMarkerEvents(newMarker);
}
