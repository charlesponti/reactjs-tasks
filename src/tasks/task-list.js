'use strict';

import React from 'react';

class TaskList extends React.Component {

  constructor(...props) {
    super(...props);
    this.state = {
      tasks: this.props.tasks || []
    };
  }

  render() {
    return (
      <ul>
        {this.state.tasks.map(task => <li> {task.title} </li>)}
      </ul>
    );
  }
}

export default TaskList;
