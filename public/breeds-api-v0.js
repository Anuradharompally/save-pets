var currbreed_val = '';

//fetching the breeds for autosugestion....
var curr_pos = $("#breeds").offset().top + $("#breeds").innerHeight();
var wide = $("input#breeds").innerWidth();

$(window).scroll(function () {

    curr_pos = curr_pos - window.scrollY;
});
$(document).ready(function () {

    //getting value of selected breeds
    var val = "empty";

    $("input[name=category]").click(function () {
        val = $("input[name=category]:checked").val();
    });

    $(document).on("keydown", '#autoSuggestionBreeds', function () {
        $("#autoSuggestionBreeds").remove();
    })

    //innerheight of field and position from top 






    $(document).on("keyup", "#breeds", function (e) {

        var code = e.which;// enter key code is 13; 

        currbreed_val = $("#breeds").val();



        $("div#autoSuggestionBreeds").remove();
        var url;
        if (val === "dog") {
            url = "https://raw.githubusercontent.com/dariusk/corpora/master/data/animals/dogs.json";
        }
        else if (val == "cat") {

            url = "https://raw.githubusercontent.com/dariusk/corpora/master/data/animals/cats.json";
        }

        else if (code != 8 && code != 46) {
            alert("please select the category ");
        }

        if (url && currbreed_val != '' && e != 13) {

            $.ajax({
                url: url,
                type: 'GET',
                dataType: "JSON",
                success: function (data) {


                    $(`<div id='autoSuggestionBreeds' class=' bg-light'
                    style='position:relative; top:-30px; width:${wide}px; max-height:250px!important; overflow-y:scroll; border:1px solid grey; border-radius:2px; z-index:100px;'>
                    </div>`).insertAfter("#breeds");
                    var arr = [];
                    if (val == "dog") {
                        for (var i = 0; i < data.dogs.length; i++) {

                            if (data.dogs[i].indexOf(currbreed_val) != -1 ||
                                data.dogs[i].substring(0, currbreed_val.length).toLowerCase() === currbreed_val.toLowerCase()) {
                                $("#autoSuggestionBreeds").append(`<div class="p-2 text-dark border-bottom">${data.dogs[i]}<div>`);
                            }


                        }
                    }
                    else {

                        for (var i = 0; i < data.cats.length; i++) {

                            if (data.cats[i].indexOf(currbreed_val) != -1 ||
                                data.cats[i].substring(0, currbreed_val.length).toLowerCase() == currbreed_val.toLowerCase()) {
                                $("#autoSuggestionBreeds").append(`<div class="p-2 text-dark border-bottom">${data.cats[i]}</div>`);
                            }


                        }
                    }

                }
            });
        }

    })

});


$(document).on("click", "div#autoSuggestionBreeds div", function () {

    $("#breeds").val($(this).text());
    $("div#autoSuggestionBreeds").remove();

})
