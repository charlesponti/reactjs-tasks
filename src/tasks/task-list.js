'use strict';

import React from 'react';

export default React.createClass({

  render: function() {
    return (
      <ul>
        {this.props.tasks.map((task) => {
          return (
            <li key={task.id} className="task-list-item">
              <input type="checkbox" value={task.completed} />
              <span>{task.description}</span>
            </li>
          );
        })}
      </ul>
    );
  }

});
