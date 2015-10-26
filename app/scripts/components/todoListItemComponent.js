import React from 'react';

let TodoListItemComponent = React.createClass({

  // propTypes: {
  //   editing: PropTypes.bool.isRequired,
  //   model: PropTypes.object.isRequired,
  //   onStartEditing: PropTypes.func.isRequired,
  //   onStopEditing: PropTypes.func.isRequired,
  // },

  // If the component updates and is in edit mode, send focus to the `<input>`.
  componentDidUpdate: function (prevProps) {
    if (this.props.editing && !prevProps.editing) {
      React.findDOMNode(this.refs.editInput).focus();
    }
  },

  // Destroying the model fires a `remove` event on the model's collection,
  // which forces an update and removes this **TodoListItemComponent** from the
  // DOM. We don't have to do any other cleanup!
  destroy: function() {
    this.props.model.destroy();
  },

  // Stop editing if the input gets an "Enter" keypress.
  handleEditKeyPress: function(event) {
    if (13 === event.keyCode) {
      this.stopEditing();
    }
  },

  render: function() {
    let inputStyles = {},
        viewStyles = {};

    // Hide the `.view` when editing
    if (this.props.editing) {
      viewStyles.display = "none";
    } else {
      // ... and hide the `<input>` when not editing
      inputStyles.display = "none";
    }

    return (
      <li className={this.props.model.get("done") ? "done" : ""}>
        <div className="view" onDoubleClick={this.startEditing} style={viewStyles}>
          <input className="toggle" type="checkbox"
            checked={this.props.model.get("done")}
            onChange={this.toggleDone} />
          <label>{this.props.model.get("title")}</label>
          <a className="destroy" onClick={this.destroy}></a>
        </div>
        <input className="edit" ref="editInput" type="text"
          onBlur={this.stopEditing}
          onChange={this.setTitle}
          onKeyPress={this.handleEditKeyPress}
          style={inputStyles}
          value={this.props.model.get("title")} />
      </li>
    );
  },

  // Set the title of this item's model when the value of the `<input>` changes.
  setTitle: function(event) {
    this.props.model.set("title", event.target.value);
  },

  // Tell the parent component this list item is entering edit mode.
  startEditing: function() {
    this.props.onStartEditing(this.props.model.id);
  },

  // Exit edit mode.
  stopEditing: function() {
    this.props.onStopEditing(this.props.model.id);
  },

  toggleDone: function(event) {
    this.props.model.set("done", event.target.checked);
  }

});

export default TodoListItemComponent;
