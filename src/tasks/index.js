'use strict';

import React from 'react';
import TaskList from './task-list';
import Tasks from './store';
import TaskForm from './task-form';
import Hashtags from './hashtags';
import dispatcher from '../app/dispatcher';

class TaskPage extends React.Component {

  constructor() {
    super();
    this.state = {
      loaded: true,
      tasks: Tasks.table ? Tasks.table.query() : []
    }
  }

  _onChange() {
    this.setState({ tasks: Tasks.getAll() });
  }

  componentWillMount() {
    if (!Tasks.table) {
      Tasks
        .loadTable()
        .then(() => {
          this.setState({
            loaded: true,
            tasks: Tasks.table.query()
          })
        });
    }
    else {
      this.setState({
        loaded: true,
        tasks: Tasks.table.query()
      })
    }
  }

  componentDidMount() {
    // Register with app dispatcher
    this.token = dispatcher.register((payload) => {
      switch (payload.actionType) {
        case 'search:hashtag':
          this.setState({
            tasks: Tasks.getByHashtag(payload.data)
          });
          break;
        case 'tasks:load':
          this.setState({
            loaded: true,
            tasks: Tasks.table.query()
          });
          break;
      }
    });

    // Watch for changes to Tasks
    Tasks.addChangeListener(this._onChange.bind(this));
  }

  componentWillUnmount() {
    // Unregister from app dispatcher
    dispatcher.unregister(this.token);
    // Unwatch for changes to Tasks
    Tasks.removeChangeListener(this._onChange.bind(this));
  }

  render() {
    let tasks = this.state.tasks.map((task) => {
      return task.getFields();
    });

    let hashtags = Tasks.isLoaded ? Tasks.getHashtags() : [];

    return (
      <div className="page">
        <h4 className="text-center"> Tasks </h4>
        <Hashtags hashtags={hashtags}/>
        <TaskForm />
        {this.state.loaded ? <TaskList tasks={tasks}/> : (
          <span> Loading Tasks </span>
        )}

      </div>
    );
  }

}

export default TaskPage;
