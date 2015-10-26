// Libs
import React from 'react';
import ReactDOM from 'react-dom';
import Backbone from 'backbone';
import LocalStorage from 'backbone.localstorage';

// Utils & components
import TodoList from './collections/todos';
import AppComponent from './components/appComponent';

// Create a new Todo collection and render the **App** into `#todoapp`.
ReactDOM.render(
  <AppComponent collection={new TodoList()} />,
  document.getElementById("todoapp")
);
