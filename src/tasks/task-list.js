'use strict';

import React from 'react';
import dispatcher from '../app/dispatcher.js';
import constants from '../app/constants.js';

export default React.createClass({

  onEditClick(task) {
    dispatcher.dispatch({
      actionType: constants.TASKS.EDIT,
      data: task
    })
  },

  /**
   * Delete task
   * @param {child} task
   */
  onDeleteClick(task) {
    dispatcher.dispatch({
      actionType: constants.TASKS.DESTROY,
      data: task
    });
  },

  render() {
    return (
      <ul className="task-list">
        {this.props.tasks.map((task) => {
          return (
            <li key={task.get("objectId")} className="task-list-item card">
              <input type="checkbox" value={task.completed} />
              <span>{task.get('description')}</span>
              <div className="pull-right">
                <i className="fa fa-edit" onClick={this.onEditClick}></i>
                <i className="fa fa-close" onClick={this.onDeleteClick.bind(this, task)}></i>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

});
