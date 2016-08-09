// url will be the form http://host.whatever/details22.html?username={{username}}

// from http://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = decodeURIComponent(window.location.search.substring(1)),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : sParameterName[1];
        }
    }
};

var username = getUrlParameter("username");

$(document).ready(function() {
  payload = {"username": username};
  $.ajax({
    type: "POST",
    url: "/scripts/findUser.sjs",
    data: JSON.stringify(payload),
    contentType: "application/json",
    dataType: "json",
    success: display, 
    error: fail
  });
});

var global_user;

function display(user) {

  global_user = user;

  // user details
  $("#firstname").append(user.fullDetails.firstname);
  $("#lastname").append(user.fullDetails.lastname);
  $("#email").append(user.fullDetails.email);
  $("#address").append(user.fullDetails.address);
  $("#city").append(user.fullDetails.city);
  $("#state").append(user.fullDetails.state);
  $("#postalCode").append(user.fullDetails.postalCode);
  $("#country").append(user.fullDetails.country);
  $("#region").append(user.fullDetails.region);
  $("#industry").append(user.fullDetails.industry);

  // features (checkboxes)
  $.ajax({
    type: "GET",
    url: "/scripts/getFeatures.sjs",
    dataType: "json",
    success: displayCheckboxes,
    error: fail
  });

  // company details
  $("#company").append(user.fullDetails.company);
  $("#revenueRange").append(user.fullDetails.revenueRange);
  $("#numEmployees").append(user.fullDetails.numEmployees);
  $("#website").append(user.fullDetails.website);

  // Marketo xml source
  $("#source").append(encodeXml(user.source));

  // Marklogic account info
  $("#accountType").append(user.fullDetails.accountType);
  $("#username").append(user.fullDetails.username);
  $("#registeredForEAML8").append(user.fullDetails.registeredForEAML8);
  $("#hasAccessToEAML9").append(user.fullDetails.hasAccessToEAML9);
  $("#registeredForNoSQLforDummies").append(user.fullDetails.registeredForNoSQLforDummies);
  $("#registrationDate").append(user.fullDetails.registrationDate);
  $("#leadSource").append(user.fullDetails.leadSource);

};

function displayCheckboxes(MLFeatures) {

  if (MLFeatures) {
    // if the user has features (in an array), check them off as you display them.

    var str = "<div class=\"row\"><div class=\"col-sm-6\">";

    for (category in MLFeatures.MarkLogicFeatures) {
      str += "<h5>" + category + "</h5>";

      for (item in MLFeatures.MarkLogicFeatures[category]) {
        var feature = MLFeatures.MarkLogicFeatures[category][item];
        var checked = "checked";

        try {
          if ($.inArray(feature, global_user.fullDetails.features) === -1) {
            checked = "";
          }
        }
        catch (err) {
          // error occurs when global_user.features doesn't exist (we can create it on this page)
          checked = "";
        }
        str += "<input type=\"checkbox\" value=\"" + feature + "\" " + checked + " >&nbsp;&nbsp;&nbsp;  " + feature + "<br/>";
      }
      str += "<br/>";

      //specify where you want a column break

      if (category === "Security") {
        str += "</div><div class=\"col-sm-6\">";
      }
    }

    str += "</div>"; //closes the second col-sm-6
    str += "</div>"; //closes .row

    str += "<br/><button onclick=\"save()\">Save Changes</button>";

    $("#features").append(str);
  }
  else {
    $("#features").append("<h5>No features to list</h5");
  }

}

// saves any changes made to the features list.
function save() {
  $("body").css("cursor", "progress");

  var n = $("input:checked").length;

  var features = [];

  for (var i = 0; i < n; i++) {
    features.push($("input:checked")[i].value);
  }

  var payload = {
    "username": global_user.fullDetails.username,
    "features": features
  }

  $.ajax({
    type: "POST",
    url: "/scripts/updateFeatures.sjs",
    data: JSON.stringify(payload),
    contentType: "application/json",
    dataType: "json",
    success: function(res) {
      $("#features").append("<div class=\"alert alert-success\" role=\"alert\">" 
                            + "<a href=\"#\" class=\"close\" data-dismiss=\"alert\" title=\"close\">×</a>"
                            + "Successfully updated " 
                            + global_user.fullDetails.username 
                            + "'s features</div>");
      $("body").css("cursor", "default");
    },
    error: function(a,b,c) {
      $("#features").append("<div class=\"alert alert-danger\" role=\"alert\">Something went wrong... :(</div>");
      fail(a,b,c);
      $("body").css("cursor", "default");
    }
  });

}

// from http://stackoverflow.com/questions/2959642/how-to-make-a-valid-string-for-xml-in-javascript
function encodeXml(s) {
  return (s
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\t/g, '&#x9;').replace(/\n/g, '&#xA;').replace(/\r/g, '&#xD;')
  );
}

function fail(jqXHR, status, errorThrown) 
{
  console.log("Failed to receive data: ");
  console.log(jqXHR);
  console.log(status);
  console.log(errorThrown)
};

