// initialize the dialog windows
$("#feedback-window").dialog({
  autoOpen: false,
  modal: true,
  show: "blind",
  hide: "blind",
  width: 525,
  height: 350,
  my: "center",
  at: "center",
  of: window
});

$("#feedback-success").dialog({
  autoOpen: false,
  modal: true,
  show: "blind",
  hide: "blind",
  width: 250,
  height: 100,
  my: "center",
  at: "center",
  of: window
});

$("#feedback-fail").dialog({
  autoOpen: false,
  modal: true,
  show: "blind",
  hide: "blind",
  width: 350,
  height: 100,
  my: "center",
  at: "center",
  of: window
});

// open the form dialog window when the link is clicked
$("#feedback-link").click(function() {
  $("#feedback-window").dialog("open");
});

// send the email via emailFeedback.sjs
function send() {
  var message = "" + $("#feedback-text").val();
  var subject = "EA Tracker feedback: " + $("#feedback-subject").val();

  var payload = {
    "message": message,
    "subject": subject
  };

  $.ajax({
    type: "POST",
    url: "/scripts/emailFeedback.sjs",
    data: JSON.stringify(payload),
    contentType: "application/json",
    dataType: "json",
    success: success,
    error: fail
  }); 
};

// if success, display the success window
function success(res) {
  if (!res) {
    fail("email", "failed", "to send");
    return;
  }

  $("#feedback-window").dialog("close");
  $("#feedback-success").dialog("open");
};

// if failed, display the failed window
//  and log the error
function fail(jqXHR, status, errorThrown) {
  $("#feedback-window").dialog("close");
  $("#feedback-fail").dialog("open");
  console.log("ERROR");
  console.log(jqXHR);
  console.log(status);
  console.log(errorThrown);
};


