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
              <li>
                <label>
                  <input type="checkbox" class="select-all" id="select_all"
                    v-model="allSelected"/>
                  Select <span v-show="allSelected">None</span><span v-show="!allSelected">All</span>
                </label>
              </li>
              <li v-for="(count, value) in content" class="list-group-item">
                <label>
                  <input type="checkbox" class="checker"
                    v-bind:value="value"
                    v-bind:checked="selected[value] || allSelected"
                    v-on:change="updateSelection"/>
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
    props: ['title', 'content', 'constraint'],
    data: function() {
      return {
        id: -1,
        selected: {},
        allSelected: false
      }
    },
    methods: {
      updateSelection(event) {
        var selection = event.target.value;
        if (this.selected[selection]) {
          delete this.selected[selection];
        } else {
          this.selected[selection] = true;
        }
        this.$emit('selection', this.constraint, this.selected);
      },
      reset() {
        this.allSelected = false;
        for (var sel in this.selected) {
          delete this.selected[sel];
        }
      },
      getSelections() {
        return Object.keys(this.selected);
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
