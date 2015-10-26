import Backbone from 'backbone';

let Todo = Backbone.Model.extend({

  defaults: function() {
    return {
      title: '',
      done: false
    };
  }

});

export default Todo;
