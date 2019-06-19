// Scrape articles
$(document).on("click", "#scrape-button", function() {
  $.ajax({
    method: "GET",
    url: "/scrape"
  })
  window.location.replace("/scrape");
});

// Delete an article
$(document).on("click", ".delete-article", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "DELETE",
      url: "/saved/" + thisId
    })
    .then(function(data) {
      // Log the response
      console.log(data);
      location.reload();
    });
});

// Save an article
$(document).on("click", ".save-article", function() {
  var thisId = $(this).attr("data-id");
  $(this).hide();
  var data = {}
  data.title =  $("#title-" + thisId).text();
  data.link = $("#link-" + thisId).text();
  $.ajax({
    method: "POST",
    dataType: "json",
    url: "/api/saved",
    data: data
  })
});

// See previous comments on an article
$(document).on("click", ".see-comments", function() {
  var thisId = $(this).attr("data-id");
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
  window.location.replace("/articles/" + thisId);
});

  // Add a comment
  $(document).on("click", "#submit-comment", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        title: $("#comment-title").val(),
        body: $("#comment-text").val()
      }
    })
      .then(function(data) {
        console.log(data);
        window.location.replace("/articles/" + data._id);
      });
      $("#comment-title").val("");
      $("#comment-text").val("");
  });
  
  // Delete a note
  $(document).on("click", ".delete-comment", function() {
    var thisId = $(this).attr("data-id");
    $.ajax({
      method: "DELETE",
      url: "/articles/" + thisId
    })
    .then(function(data) {
      console.log(data);
      location.reload();
    }); 
});

