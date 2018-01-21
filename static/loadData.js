loadData2 = () => {
  $.ajax({
    url: '/load_data',
    type: 'post',
    dataType: 'json',
    contentType: 'application/json',
    success: function (xhr) {
      console.log(xhr);
    },
    error: function(xhr) {
      alert('nuh');
      console.log(xhr);
    }
  });
}
