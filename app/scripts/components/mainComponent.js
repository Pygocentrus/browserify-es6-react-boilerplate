import React from 'react';
import TodoListComponent from '../components/todoListComponent';
import FooterComponent from '../components/footerComponent';

let MainComponent = React.createClass({

  // propTypes: {
  //   clearCompletedItems: PropTypes.func.isRequired,
  //   collection: PropTypes.object.isRequired,
  //   toggleAllItemsCompleted: PropTypes.func.isRequired,
  // },

  toggleAllItemsCompleted: function(event) {
    this.props.toggleAllItemsCompleted(event.target.checked);
  },

  render: function() {
    if (0 === this.props.collection.length) {
      // Don't display the "Mark all as complete" button and the footer if there
      // are no **Todo** items.
      return null;
    } else {
      return (
        <section id="main">
          <input id="toggle-all" type="checkbox"
            checked={0 === this.props.collection.remaining().length}
            onChange={this.toggleAllItemsCompleted} />
          <label htmlFor="toggle-all">
            Mark all as complete
          </label>
          <TodoListComponent collection={this.props.collection} />
          <FooterComponent
            clearCompletedItems={this.props.clearCompletedItems}
            itemsRemainingCount={this.props.collection.remaining().length}
            itemsDoneCount={this.props.collection.done().length} />
        </section>
      );
    }
  }

});

export default MainComponent;
