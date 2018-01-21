function createNewGroup() {
  $.ajax({
      url: '/create_group',
      type: 'get',
      contentType: 'application/json',
      success: function (xhr) {
        let groupId = JSON.parse(xhr)["key"];
        window.location.href = '/group/' + groupId;
      },
      error: function(xhr) {
        window.alert('Error has occurred. Please try again');
      }
    });
}
