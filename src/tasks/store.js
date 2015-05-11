'use strict';

import {EventEmitter} from 'events';
import dispatcher from '../app/dispatcher.js';
import constants from '../app/constants.js';
import _ from 'lodash';

/**
 * Reference to this file's module
 * @type {{}}
 */
let Tasks = {};

/**
 * Whether store has been loaded
 * @type {boolean}
 * @private
 */
Tasks.isLoaded = false;

/**
 * Currently logged in user if current user
 * @type {object}
 */
Tasks.currentUser = Parse.User.current();

const TaskConstants = constants.TASKS;
const CHANGE_EVENT = 'change';

/**
 * Model for tasks
 */
const Task = Parse.Object.extend('TaskObject', {

  getHashtags() {
    return this.get('hashtags') || [];
  }

});

/**
 * Collection for taskss
 * @type {Selection.extend}
 */
let TaskCollection = Parse.Collection.extend(_.merge(EventEmitter.prototype, {

  // Set model of collection
  model: Task,

  /**
   * True if store has been loaded, false if it has not
   * @type {boolean}
   */
  isLoaded: false,

  load() {
    return new Promise((resolve, reject) => {
      return Tasks.collection.fetch({
        success: (...args) => {
          Tasks.isLoaded = true;
          return resolve(...args);
        },
        error: () => {
          return reject(...args);
        }
      });
    });
  },

  /**
   * Create a new task
   * @param  {string} task
   */
  addTask(task) {
    task.complete = false;
    task.hashtags = Tasks.collection.parseHashtags(task.description);
    this.create(task, {
      success(response) {
        response.collection.emitChange();
      },
      error() {
        debugger;
      }
    });
  },

  /**
   * Update a TODO item.
   * @param  {string} id
   * @param {object} updates An object literal containing only the data to be
   *     updated.
   */
  update(id, updates) {
    var task = this.table.query({ id: id })[0];
    if (task) {
      return Object.keys(updates).forEach((key) => {
        return task.set(key, updates[key]);
      });
    } else {
      return console.warn(`Task ${id} could not be found`);
    }
  },

  /**
   * Update all of the TODO items with the same object.
   *     the data to be updated.  Used to mark all TODOs as completed.
   * @param  {object} updates An object literal containing only the data to be
   *     updated.
   */
  updateAll(updates) {
    let tasks = this.table.query();
    return tasks.forEach(function(task) {
      TaskCollection.update(task.get('id'), updates);
    });
  },

  /**
   * Delete a TODO item.
   * @param  {string} id
   */
  destroy(id) {
    delete _tasks[id];
  },

  /**
   * Delete all the completed TODO items.
   */
  destroyCompleted() {
    for (var id in _tasks) {
      if (_tasks[id].complete) {
        destroy(id);
      }
    }
  },

  /**
   * Tests whether all the remaining TODO items are marked as completed.
   * @return {boolean}
   */
  areAllComplete: function() {
    for (var id in _tasks) {
      if (!_tasks[id].complete) {
        return false;
      }
    }
    return true;
  },

  /**
   * Get the entire collection of TODOs.
   * @return {object}
   */
  getAll: function() {
    return this.table.query();
  },

  /**
   * @description Get store's records filtered on property by value
   * @param  {*} property Property to filter records on
   * @param  {*} value    Value to filter for
   * @return {Array}
   */
  getBy(property, value, not) {
    let tasks = this.table.query();
    if (not)
      return tasks.filter(record => record[property] !== value);
    else
      return tasks.filter(record => record[property] === value);
  },

  getByHashtag(hashtag) {
    return Tasks.collection.models.filter(function(task) {
      let tags = task.get('hashtags');
      return tags.length() && ~tags.toArray().indexOf(hashtag);
    });
  },

  /**
   * @description Get hashtags from store's records
   * @returns {Array}
   */
  getHashtags() {
    return Tasks.collection.models
      .filter((task)=> {
        return task.getHashtags().length;
      })
      .map((task) => task.get('hashtags'));
  },

  /**
   * @description Get array of hashtags from text
   * @param  {String} text Text to search for hashtags
   * @return {Array}      List of hashtags
   */
  parseHashtags(text) {
    return text.match(/(#[a-z\d][\w-]*)/ig) || [];
  },

  emitChange: function() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

}));

// Check user authentication
if (Tasks.currentUser) {
  console.log(Tasks.currentUser);
}

// Register callback to handle all updates
dispatcher.register(function(action) {
  let text;
  let collection = Tasks.collection;

  switch(action.actionType) {
    case TaskConstants.CREATE:
      if (action.data.description !== '') {
        collection.addTask(action.data);
        collection.emitChange();
      }
      break;

    case TaskConstants.TOGGLE_COMPLETE_ALL:
      if (Tasks.areAllComplete()) {
        collection.updateAll({complete: false});
      } else {
        collection.updateAll({complete: true});
      }
      collection.emitChange();
      break;

    case TaskConstants.UNDO_COMPLETE:
      collection.update(action.id, {complete: false});
      collection.emitChange();
      break;

    case TaskConstants.COMPLETE:
      collection.update(action.id, {complete: true});
      collection.emitChange();
      break;

    case TaskConstants.UPDATE:
      text = action.text.trim();
      if (text !== '') {
        collection.update(action.id, {text: text});
        collection.emitChange();
      }
      break;

    case TaskConstants.DESTROY:
      action.data.destroy({
        success(object) {
          collection.emitChange();
        },
        error(object, err) {
          debugger;
        }
      });
      break;

    default:
    // no op
  }

});

Tasks.model = Task;

Tasks.collection = new TaskCollection();

export default Tasks;
