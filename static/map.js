var map;

function initMap() {
  var myLatlng = {lat: 45.5017, lng: -73.5673};

  map = new google.maps.Map(document.getElementById('map'), {
    center: myLatlng,
    zoom: 8
  });

  var marker = new google.maps.Marker({
    position: myLatlng,
    map: map,
    title: 'Click to zoom'
  });


  map.addListener('click', function(e) {
    placeMarkerAndPanTo(e.latLng, map);
  });

}

function placeMarkerAndPanTo(latLng, map) {
    var marker = new google.maps.Marker({
      position: latLng,
      map: map
    });
    map.panTo(latLng);
}