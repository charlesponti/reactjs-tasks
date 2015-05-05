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
      loaded: Tasks._isLoaded,
      tasks:  Tasks._isLoaded ? Tasks.tasks : []
    }
  }

  _onChange() {
    this.setState({ tasks: TaskStore.getAll() });
  }

  componentWillMount() {
    Tasks.collection.load()
      .then((collection) => {
        return this.setState({
          loaded: true,
          tasks: collection.models
        });
      });
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
    Tasks.collection.on('change', this._onChange.bind(this));
  }

  componentWillUnmount() {
    // Unregister from app dispatcher
    dispatcher.unregister(this.token);
    // Unwatch for changes to Tasks
    Tasks.collection.on('change', this._onChange.bind(this));
  }

  render() {
    let tasks = this.state.tasks.map((task) => {
      return task.getFields();
    });

    let hashtags = Tasks._isLoaded ? Tasks.getHashtags() : [];

    return (
      <div className="page">
        <h4 className="text-center"> Tasks </h4>
        <Hashtags hashtags={hashtags}/>
        <TaskForm />
        {this.state.loaded ? <TaskList tasks={tasks}/> : (
          <div className="text-center">
            <i className="fa fa-spinner fa-spin fa-2x"></i>
          </div>
        )}

      </div>
    );
  }

}

export default TaskPage;
