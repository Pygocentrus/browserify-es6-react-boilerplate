import React from 'react';
import TodoListItemComponent from './todoListItemComponent';

let TodoListComponent = React.createClass({

  // propTypes: {
  //   collection: PropTypes.object.isRequired,
  // },

  // Start with no item in edit mode.
  getInitialState: function() {
    return {
      editingModelId: null
    };
  },

  // When a `TodoListItemComponent` starts editing, it passes its model's ID to
  // this callback. Setting the state triggers this component to re-render and
  // render that `TodoListItemComponent` in edit mode.
  setEditingModelId: function(modelId) {
    this.setState({ editingModelId: modelId });
  },

  unsetEditingModelId: function(modelId) {
    if (modelId === this.state.editingModelId) {
      this.setState({ editingModelId: null });
    }
  },

  render: function() {
    let items = this.props.collection.map(function(model) {
      // Pass the `key` attribute[1] a unique ID so React can track the
      // elements properly.
      return (
        <TodoListItemComponent
          editing={this.state.editingModelId === model.id}
          key={model.id}
          model={model}
          onStartEditing={this.setEditingModelId}
          onStopEditing={this.unsetEditingModelId} />
      );
    }, this);

    return (
      <ul id="todo-list">
        {items}
      </ul>
    );
  }

});

export default TodoListComponent;
