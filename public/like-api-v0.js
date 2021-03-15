$(document).on("click", ".like-click", function () {
  var $this = $(this);
  var id = $(this).val();
  var like =
  {
    likes: $(this).parent().find('.likes').text()
  }

  var val = $(this).parent().find('.likes').attr("value");

  $.ajax({
    url: "/pets/like/" + id,
    type: "post",
    data: like,
    dataType: "JSON",
    success: function (data) {

      $(`button[disliked=${id}]`).parent().parent().parent().parent().remove();

    }

  });

});

