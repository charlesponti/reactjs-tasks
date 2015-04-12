'use strict';

import React from 'react';
import TaskList from './task-list';
import Tasks from './store';
import TaskForm from './task-form';
import Hashtags from './hashtags';
import dispatcher from '../app/dispatcher';
const dropbox = require('../dropbox-client');

class TaskPage extends React.Component {

  constructor() {
    super();
    this.state = {
      tasks: Tasks.getAll()
    };
  }

  _onChange() {
    this.setState({ tasks: Tasks.getAll() });
  }

  componentDidMount() {
    // Register with app dispatcher
    this.token = dispatcher.register((payload) => {
      switch (payload.actionType) {
        case 'search:hashtag':
          this.setState({
            tasks: Tasks.getByHashtag(payload.data)
          });
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
    let tasks = Object.keys(this.state.tasks).map((key) => {
      return this.state.tasks[key];
    });

    let hashtags = Tasks.getHashtags();

    return (
      <div className="page">
        <h4 className="text-center"> Tasks </h4>
        <Hashtags hashtags={hashtags}/>
        <TaskForm />
        <TaskList tasks={tasks}/>
      </div>
    );
  }

}

export default TaskPage;
