<template>
  <div class="facet" id="">
    <div class="">
      <div class="panel-group" id="accordion">
        <div class="panel panel-default">
          <div class="panel-heading">
            <a data-toggle="collapse" v-bind:href="'#facet-' + this.id"><h4 class="panel-title">{{title}}</h4></a>
          </div>
          <div v-bind:id="'facet-' + id" class="panel-collapse collapse in">
            <ul class="list-group">
              <li><label><input type="checkbox" class="select-all" id="select_all"/>Select All</label></li>
              <li v-for="(count, value) in values" class="list-group-item">
                <label>
                  <input type="checkbox" class="checker" v-bind:value="value"/>
                  <span>{{ value }} ({{ count }})</span>
                </label>
              </li>
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
        id: -1,
        values: {}
      }
    },
    methods: {
      displayData(data) {
        console.log('facet displayData');
        this.values = data;
      }
    },
    created: function() {
      this.id = this._uid
    }
  }
</script>

<style>
  .list-group-item label {
    font-weight: normal;
  }

  /* centers text on selection menu */
  h4 {
    text-align: center;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

</style>
