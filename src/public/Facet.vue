<template>
  <div class="facet" id="">
    <div class="">
      <div class="panel-group" id="accordion">
        <div class="panel panel-default">
          <div class="panel-heading">
            <a data-toggle="collapse" v-bind:href="'#facet-' + this.id"><h4 class="panel-title">{{title}}</h4></a>
          </div>
          <div v-bind:id="'facet-' + id" class="panel-collapse collapse in">
            <ul class="list-group" id="eaUL">
              <li><label><input type="checkbox" class="select-all" id="select_all_i"/>Select All</label></li>
              <!--<li v-for="item of items">
                <label>
                  <input type="checkbox" class="checker" value="item.value">
                  <span>{{ item.message }}</span>
                </label>
              </li>-->
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
  export default {
    props: ['title'],
    data: function() {
      return {
        id: -1
      }
    },
    methods: {
    },
    created: function() {
      this.id = this._uid
    }
  }
</script>

<style>
</style>
