$("#feedback-window").dialog({autoOpen:false, modal:true, show:"blind",hide:"blind"});

$("#feedback-link").click(function() {
  $("#feedback-window").dialog("open");
});



