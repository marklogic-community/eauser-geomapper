<template>
  <div v-if="loggedIn">
    <span class="welcome">Welcome, {{username}}</span>
    <button class="btn btn-default btn-sm" v-on:click="logout">Logout</button>
  </div>
  <form v-else class="form-inline">
    <div class="form-group">
      <label>Username</label>
      <input v-model="username" type="text">
    </div>
    <div class="form-group">
      <label>Password</label>
      <input v-model="password" type="password">
    </div>
    <button class="btn btn-default btn-sm" v-on:click="login">Login</button>
  </form>
</template>

<script>
  export default {
    data: function() {
      'use strict';
      return {
        username: '',
        password: '',
        loggedIn: false
      };
    },
    created: function() {
      'use strict';
      console.log('created');
      var vm = this;

      $.ajax({
        url: '/scripts/login/currentUser.sjs',
        method: 'GET',
        dataType: 'json',
        success: function(data) {

          if (data.isEditor) {
            vm.loggedIn = true;
          } else {
          }
        }
      });

    },
    methods: {
      login: function(event) {
        'use strict';

        var vm = this;

        $.ajax({
          url: '/scripts/login/login.sjs',
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          data: {
            'username': this.username,
            'password': this.password
          },
          dataType: 'json',
          success: function(data, textStatus, jqXHR) {
            console.log('login success');
            // vm.$set('loggedIn', true);
            vm.loggedIn = true;
          },
          error: function() {
            console.log('login failed');
          }
        });

        event.preventDefault();
      },
      logout: function(event) {
        'use strict';
        var vm = this;
        $.ajax({
          url: '/scripts/login/logout.sjs',
          method: 'GET',
          success: function() {
            vm.loggedIn = false;
          },
          error: function() {
            console.log('failed to log out');
          }
        });
      }
    }
  }
</script>

<style>
</style>
