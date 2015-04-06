'use strict';

import React from 'react';

class TaskList extends React.Component {

  constructor(...props) {
    super(...props);
  }

  render() {
    return (
      <ul>
        {this.props.tasks.map((task) => {
          return (
            <li key={task.id}>
              <input type="checkbox" value={task.completed} />
              <span>{task.description}</span>
            </li>
          );
        })}
      </ul>
    );
  }
}

export default TaskList;
