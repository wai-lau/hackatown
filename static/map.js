var map;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 45.5017, lng: -73.5673},
    zoom: 10
  });
  console.log(markers)
  for (let i = 0; i < markers.length; i++) {
    var marker = new google.maps.Marker({
      position: markers[i]['position'],
      map: map,
    });
  }

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
