$(document).on("click", ".like-click", function () {
  var $this = $(this);
  var id = $(this).val();
  var like =
  {
    likes: $(this).parent().find('.likes').text()
  }

  var val = $(this).parent().find('.likes').attr("value");
  setTimeout(() => {

    $.ajax({
      url: "/alldogs/like/" + id,
      type: "post",
      data: like,
      dataType: "JSON",
      success: function (data) {
        if (data == "login") {
          window.location.replace('/login');
        }
        else {
          $this.parent().find('.likes').text(data.likes);
          if (data.like)
            $this.find("i").css("color", `red`);
          else {
            $this.find("i").css("color", `white`);
            $(`button[disliked=${id}]`).parent().parent().parent().remove();

          }
        }
      },
      error: function (error) {
        alert("please login first");
      }

    });
  }, 1000);


});


