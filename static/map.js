let KEY = ''
let MAP = null
let MARKERS = {}

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
    placeMarkerAndPanTo(e.latLng, MAP);
    let name = Date.now() + Math.random();
    console.log(name)
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
