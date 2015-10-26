import React from 'react';

let FooterComponent = React.createClass({

  // propTypes: {
  //   itemsDoneCount: PropTypes.number.isRequired,
  //   itemsRemainingCount: PropTypes.number.isRequired,
  // },

  render: function() {
    let clearCompletedButton;

    // Show the "Clear X completed items" button only if there are completed
    // items.
    if (this.props.itemsDoneCount > 0) {
      clearCompletedButton = (
        <a id="clear-completed" onClick={this.props.clearCompletedItems}>
          Clear {this.props.itemsDoneCount} completed
          {1 === this.props.itemsDoneCount ? " item" : " items"}
        </a>
      );
    }

    // Clicking the "Clear X completed items" button calls the
    // "clearCompletedItems" function passed in on `props`.
    return (
      <footer>
        {clearCompletedButton}
        <div className="todo-count">
          <b>{this.props.itemsRemainingCount}</b>
          {1 === this.props.itemsRemainingCount ? " item" : " items"} left
        </div>
      </footer>
    );
  }

});

export default FooterComponent;
