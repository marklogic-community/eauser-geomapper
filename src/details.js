/* jshint devel:true */
/* exported save */

// url will be the form http://host.whatever/details22.html?email={{email}}

var globalUser;

// from http://stackoverflow.com/questions/19491336/get-url-parameter-jquery-or-how-to-get-query-string-values-in-js
var getUrlParameter = function getUrlParameter(sParam) {
  'use strict';

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

var email = getUrlParameter('email');

function createDropdown(MarketoFields) {
  'use strict';
  
  for (var field in MarketoFields) {
    $('#other-select').append('<option value="' + MarketoFields[field] + '">' + MarketoFields[field] + '</option>');
  }
  $('#other-select').change();
}

function fail(jqXHR, status, errorThrown)
{
  'use strict';

  console.log('Failed to receive data: ');
  console.log(jqXHR);
  console.log(status);
  console.log(errorThrown);
}

function displayCheckboxes(MLFeatures) {
  'use strict';

  var str = null;

  if (MLFeatures) {
    // if the user has features (in an array), check them off as you display them.

    str = '<div class="row"><div class="col-sm-6">';

    for (var category in MLFeatures.MarkLogicFeatures) {
      str += '<h5>' + category + '</h5>';

      for (var item in MLFeatures.MarkLogicFeatures[category]) {
        var feature = MLFeatures.MarkLogicFeatures[category][item];
        var checked = 'checked';

        try {
          if ($.inArray(feature, globalUser.fullDetails.features) === -1) {
            checked = '';
          }
        }
        catch (err) {
          // error occurs when globalUser.features doesn't exist (we can create it on this page)
          checked = '';
        }
        str += '<input type="checkbox" value="' + feature + '" ' + checked + ' >&nbsp;&nbsp;&nbsp;  ' + feature + '<br/>';
      }
      str += '<br/>';

      //specify where you want a column break

      if (category === 'Security') {
        str += '</div><div class="col-sm-6">';
      }
    }

    str += '</div>'; //closes the second col-sm-6
    str += '</div>'; //closes .row

    str += '<div id="saveButtonDiv"><br/><button onclick="save()">Save Changes</button></div>';

  }
  else {
    str = '<h5>No features to list</h5';
  }
  var customNotes = globalUser.fullDetails.customNotes;
  customNotes = customNotes !== undefined ? customNotes : '';

  str += '<div id="customNotesDiv"><h4> Notes: </h4> <textarea id=customNotesArea rows="5" cols="70">' + customNotes + '</textarea></div>';
  $('#features').append(str);
}

function display(user) {
  'use strict';

  globalUser = user;

  // user details
  $('#firstname').append(user.fullDetails.firstname);
  $('#lastname').append(user.fullDetails.lastname);
  $('#email').append(user.fullDetails.email);
  $('#address').append(user.fullDetails.address);
  $('#city').append(user.fullDetails.city);
  $('#state').append(user.fullDetails.state);
  $('#postalCode').append(user.fullDetails.postalCode);
  $('#country').append(user.fullDetails.country);
  $('#region').append(user.fullDetails.region);
  $('#industry').append(user.fullDetails.industry);

  // features (checkboxes)
  $.ajax({
    type: 'GET',
    url: '/scripts/getFeatures.sjs',
    dataType: 'json',
    success: displayCheckboxes,
    error: fail
  });

  // company details
  $('#company').append(user.fullDetails.company);
  $('#revenueRange').append(user.fullDetails.revenueRange);

  // num employees is almost always null. Should we ignore it?
  $('#numEmployees').append(user.fullDetails.numEmployees);
  $('#website').append(user.fullDetails.website);

  // other marketo fields (dropdown)
  $.ajax({
    type: 'GET',
    url: '/scripts/getMarketoFields.sjs',
    dataType: 'json',
    success: createDropdown,
    error: fail
  });


  // Marklogic account info
//  $('#accountType').append(user.fullDetails.accountType);
  $('#username').append(user.fullDetails.username);
  $('#registeredForEAML8').append(user.fullDetails.registeredForEAML8);
  $('#hasAccessToEAML9').append(user.fullDetails.hasAccessToEAML9);
  $('#registeredForNoSQLforDummies').append(user.fullDetails.registeredForNoSQLforDummies);
  $('#leadSource').append(user.fullDetails.leadSource);
  $('#registrationDate').append(user.fullDetails.registrationDate);
  $('#marketoLastUpdated').append(user.fullDetails.marketoLastUpdated);
  for (var i in user.fullDetails.ea_version) {
    if (i === '0') {
      $('#ea-version').append(user.fullDetails.ea_version[i]);
    }
    else {
      $('#ea-version').append(', ' + user.fullDetails.ea_version[i]);
    }
  }

}

$(document).ready(function() {
  'use strict';

  var payload = {'email': email};
  $.ajax({
    type: 'POST',
    url: '/scripts/findUser.sjs',
    data: JSON.stringify(payload),
    contentType: 'application/json',
    dataType: 'json',
    success: display,
    error: fail
  });
});

$('#other-select').change(function () {
  'use strict';

  var payload = {
    'field': $('#other-select option:selected').val(),
    'id': globalUser.fullDetails.id
  };

  $.ajax({
    type: 'POST',
    url: '/scripts/queryMarketoFieldForID.sjs',
    data: JSON.stringify(payload),
    contentType: 'application/json',
    dataType: 'json',
    success: function(res) {
      $('#other-result').replaceWith('<td id="other-result">' + res.val + '</td>');
    },
    error: fail
  });
});


// saves any changes made to the features list.
function save() {
  'use strict';

  $('body').css('cursor', 'progress');

  var customNotes = document.getElementById('customNotesArea').value;

  var n = $('input:checked').length;

  var features = [];

  for (var i = 0; i < n; i++) {
    features.push($('input:checked')[i].value);
  }

  var payload = {
    'email': globalUser.fullDetails.email,
    'features': features,
    'customNotes': customNotes
  };

  $.ajax({
    type: 'POST',
    url: '/scripts/updateFeatures.sjs',
    data: JSON.stringify(payload),
    contentType: 'application/json',
    dataType: 'json',
    success: function(res) {
      $('#features').append('<div class="alert alert-success" role="alert">' +
                            '<a href="#" class="close" data-dismiss="alert" title="close">×</a>' +
                            'Successfully updated ' +
                            globalUser.fullDetails.email +
                            '\'s features</div>');
      $('body').css('cursor', 'default');
    },
    error: function(a,b,c) {
      $('#features').append('<div class="alert alert-danger" role="alert"><a href="#" class="close" data-dismiss="alert" title="close">×</a>Something went wrong... :(</div>');
      fail(a,b,c);
      $('body').css('cursor', 'default');
    }
  });

}
