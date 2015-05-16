'use strict';

import React from 'react';
import dispatcher from '../app/dispatcher';
import constants from '../app/constants';

export default React.createClass({

  getInitialState() {
    return {};
  },

  componentWillMount() {
    this.dipatchToken = dispatcher.register((payload) => {
      switch(payload.actionType) {
        case constants.TASKS.EDIT:
          this.setState({
            value: payload.data.get('description')
          })
      }
    })
  },

  /**
   * Handle form submission
   * @param {SyntheticEvent} event
   */
  onSubmit(event) {
    event.preventDefault();

    // Empty input value
    this.setState({ value: '' });

    // Dispatch task creation event
    dispatcher.dispatch({
      actionType: constants.TASKS.CREATE,
      data: {
        description: this.refs.name.getDOMNode().value
      }
    })
  },

  /**
   * Set value of input field to state.value on change
   */
  onChange() {
    this.setState({ value: this.refs.name.getDOMNode().value });
  },

  render() {
    return (
      <section className="card">
        <form className="task-form" onSubmit={this.onSubmit}>
          <input onChange={this.onChange}
                 placeholder="Search tasks or create new task"
                 ref="name"
                 required
                 type="text"
                 value={this.state.value}/>
        </form>
      </section>
    );
  }

});
