'use strict';

import React from 'react';
import tasks from './tasks';

class TaskForm extends React.Component {

  constructor() {
    super();
  }

  onSubmit() {
    let value = this.refs.name.getDOMNode().value;
    tasks.add({ task: value });
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
