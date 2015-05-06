'use strict';

import React from 'react';

export default React.createClass({

  onEditClick() {

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
              <span>{task.get("title")}</span>
              <div className="pull-right">
                <i className="fa fa-edit" onClick={this.onEditClick}></i>
                <i className="fa fa-close" onClick={this.onDeleteClick}></i>
              </div>
            </li>
          );
        })}
      </ul>
    );
  }

});
