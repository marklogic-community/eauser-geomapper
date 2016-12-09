<template>
  <div class="facet">
    <div class="">
      <div class="panel-group" id="accordion">
        <div class="panel panel-default">
          <div class="panel-heading">
            <a data-toggle="collapse"v-bind:href="'#facet-' + this.id"><h4 class="panel-title">Regions</h4></a>
          </div>
          <div v-bind:id="'facet-' + id" class="panel-collapse collapse in">
            <ul class="list-group">
              <li v-for="feature in content.features" class="list-group-item">
                <label>
                  <input type="checkbox" class="rChecker" v-on:click="selectRegion"
                    v-bind:value="feature.properties.name"/>
                  <span>{{feature.properties.name}}</span>
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
    props: ['content'],
    data: function() {
      return {
        id: -1,
        selected: {}
      }
    },
    methods: {
      selectRegion: function(event) {
        this.$emit('selection', event.target.value, event.target.checked);
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
