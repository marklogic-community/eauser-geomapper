<template>
  <div>
    <button type="button" class="btn btn-primary btn-sm center-block"
      data-toggle="modal"
      v-bind:data-target="'#feedback-' + id">Send Feedback</button>

    <div class="modal fade" v-bind:id="'feedback-' + id" tabindex="-1" role="dialog">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
            <h4 class="modal-title">Feedback</h4>
          </div>
          <div class="modal-body">
            <p>Let us know what you think...</p>
            <textarea v-model="subject" rows="1" cols="50" placeholder="Subject line"></textarea>
            <textarea v-model="message" rows="8" cols="50" placeholder="no trolling please :)"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" data-dismiss="modal" v-on:click="send()">Send</button>
          </div>
        </div><!-- /.modal-content -->
      </div><!-- /.modal-dialog -->
    </div><!-- /.modal -->
  </div>
</template>

<script>
  export default {
    data: function() {
      return {
        subject: '',
        message: '',
        id: -1
      }
    },
    methods: {
      send(event) {
        this.$emit('send', this.subject, this.message);
      }
    },
    created : function(){
      this.id = this._uid
    }
  }
</script>

<style>
</style>
