/* global console */

// Builds HTML like this:
// <div class="form-group">
//   <label>label</label>
//   <input name="name" type="type">
// </div>
function buildFormGroup(label, name, type) {
  'use strict';

  var group = document.createElement('div');
  group.setAttribute('class', 'form-group');

  var labelEl = document.createElement('label');
  labelEl.appendChild(document.createTextNode(label));
  group.appendChild(labelEl);

  var input = document.createElement('input');
  input.setAttribute('type', type);
  input.setAttribute('name', name);
  group.appendChild(input);

  return group;
}

// Build the login form
function buildLogin() {
  'use strict';

  var userDiv = document.getElementById('user');
  userDiv.innerHTML = '';

  var form = document.createElement('form');
  form.setAttribute('class', 'form-inline');

  form.appendChild(buildFormGroup('Username', 'username', 'text'));
  form.appendChild(buildFormGroup('Password', 'password', 'password'));

  var btn = document.createElement('button');
  btn.setAttribute('class', 'btn btn-default btn-sm');
  btn.appendChild(document.createTextNode('Login'));
  btn.addEventListener('click', login, false);

  form.appendChild(btn);
  userDiv.appendChild(form);
}

function logout(event) {
  'use strict';

  $.ajax({
    url: '/scripts/login/logout.sjs',
    method: 'GET',
    success: buildLogin,
    failure: function() {
      console.log('failed to log out');
    }
  });

}

// Display a welcome with the user's name
function welcomeUser(username) {
  'use strict';

  var userDiv = document.getElementById('user');
  userDiv.innerHTML = '';

  var welcome = document.createElement('span');
  welcome.setAttribute('class', 'welcome');
  welcome.appendChild(document.createTextNode('Welcome, ' + username));

  var logoutBtn = document.createElement('button');
  logoutBtn.setAttribute('class', 'btn btn-default btn-sm');
  logoutBtn.appendChild(document.createTextNode('Logout'));
  logoutBtn.addEventListener('click', logout, false);

  userDiv.appendChild(welcome);
  userDiv.appendChild(logoutBtn);
}

function login(event) {
  'use strict';

  var username = document.querySelector('#user input[name=username').value;
  var password = document.querySelector('#user input[name=password').value;

  $.ajax({
    url: '/scripts/login/login.sjs',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: {
      'username': username,
      'password': password
    },
    dataType: 'json',
    success: function(data, textStatus, jqXHR) {
      welcomeUser(data.currentUser);
    },
    failure: function() {
      console.log('login failed');
    }
  });

  event.preventDefault();
}

$.ajax({
  url: '/scripts/login/currentUser.sjs',
  method: 'GET',
  dataType: 'json',
  success: function(data) {
    'use strict';

    if (data.isEditor) {
      welcomeUser(data.currentUser);
    } else {
      buildLogin();
    }
  }
});
