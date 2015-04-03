'use strict';

import React from 'react';
import TaskList from './task-list';
import Tasks from '../../data/tasks';

class TaskPage extends React.Component {

  constructor() {
    this.state = {
      Tasks: Tasks
    };
  }

  render() {
    return (
      <div className="page">
        <h2 className="text-center"> Tasks </h2>
        <TaskList tasks={this.state.Tasks.toArray()}/>
      </div>
    );
  }

}

export default TaskPage;
