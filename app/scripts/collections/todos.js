import Backbone from 'backbone';
import Todo from '../models/todo';

let TodoList = Backbone.Collection.extend({

  model: Todo,

  localStorage: new Backbone.LocalStorage("todos-react"),

  done: function () {
    return this.where({ done: true });
  },

  remaining: function () {
    return this.where({ done: false });
  }

});

export default TodoList;
