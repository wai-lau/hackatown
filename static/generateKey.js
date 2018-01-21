function createNewGroup() {
  let key = $('#inputHash').val();
  $.ajax({
      url: '/create_group/' + key,
      type: 'post',
      contentType: 'application/json',
      success: function (xhr) {
        window.alert('Redirecting now...');
        window.location.href = '/group/' + key;
      },
      error: function(xhr) {
        window.alert('Group name has already been created!');
      }
    });
}
