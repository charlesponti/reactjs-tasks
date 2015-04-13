'use strict';

import React from 'react';

export default React.createClass({

  render: function() {
    return (
      <ul className="task-list">
        {this.props.tasks.map((task) => {
          return (
            <li key={task.id} className="task-list-item card">
              <input type="checkbox" value={task.completed} />
              <span>{task.description}</span>
            </li>
          );
        })}
      </ul>
    );
  }

});
