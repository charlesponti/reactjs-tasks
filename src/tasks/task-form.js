'use strict';

import React from 'react';
import tasks from './tasks';
import dispatcher from '../app/dispatcher';
import constants from '../app/constants';

class TaskForm extends React.Component {

  constructor() {
    super();
  }

  /**
   * Handle form submission
   * @param {SyntheticEvent} event
   */
  onSubmit(event) {
    event.preventDefault();
    dispatcher.dispatch({
      actionType: constants.TASKS.CREATE,
      data: {
        description: this.refs.name.getDOMNode().value
      }
    })
  }

  render() {
    return (
      <section className="card">
        <form className="task-form" onSubmit={this.onSubmit.bind(this)}>
          <input onKeyUp={this.onKeyUp}
                 placeholder="Search tasks or create new task"
                 ref="name"
                 required
                 type="text" />
        </form>
      </section>
    );
  }

}

export default TaskForm;
