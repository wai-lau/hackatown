let KEY = ''

function initMap(markers, key) {
  KEY = key;
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 45.5017, lng: -73.5673},
    zoom: 10
  });
  console.log(markers)
  for (let i = 0; i < markers.length; i++) {
    var marker = new google.maps.Marker({
      position: markers[i]['position'],
      map: map
    });
    }

    map.addListener('click', (e, key) => {
      placeMarkerAndPanTo(e.latLng, map);
      $.ajax({
          url: '/add_marker/' + KEY,
          type: 'post',
          dataType: 'json',
          data: {'latLng': JSON.stringify(e.latLng)},
          success: function (xhr) {
            console.log("YAY! " + xhr);
          },
          error: function(xhr) {
            window.alert(xhr);
          }
        });
     });
}

function placeMarkerAndPanTo(latLng, map) {
    var marker = new google.maps.Marker({
      position: latLng,
      map: map
    });
    //map.panTo(latLng);
}
