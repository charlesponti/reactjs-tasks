'use strict';

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

const Task = Parse.Object('TaskObject');

let TaskCollection = new Parse.Collection({
  /**
   * True if store has been loaded, false if it has not
   * @type {boolean}
   */
  isLoaded: false,

  table: null,

  /**
   * Create a new task
   * @param  {string} task
   */
    create(task) {
    task.id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
    task.complete = false;
    task.hashtags = TaskCollection.parseHashtags(task.description);
    this.table.insert(task);
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
    let tasks = this.table.query();

    return tasks.filter(function(task) {
      let tags = task.get('hashtags');
      return tags.length() && ~tags.toArray().indexOf(hashtag);
    });
  },

  /**
   * @description Get hashtags from store's records
   * @returns {Array}
   */
    getHashtags() {
    var hashtags = [];
    let tasks = this.table.query();

    tasks.forEach((task)=> {
      let taskTags = task.get('hashtags');
      if (taskTags.length()) {
        hashtags = hashtags.concat(taskTags.toArray());
      }
    });

    return hashtags;
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
});

// Check user authentication
if (currentUser) {
  console.log(currentUser);
}
else {
  Parse.User.logIn(username, {
    success: (user) => {
      this.undelegateEvents();
    },
    error: (user, error) => {
      this.$(".login-form .error").html("Invalid username or password. Please try again.").show();
      this.$(".login-form button").removeAttr("disabled");
    }
  });
}

// Register callback to handle all updates
dispatcher.register(function(action) {
  let text;

  switch(action.actionType) {
    case TaskConstants.CREATE:
      if (action.data.description !== '') {
        Tasks.create(action.data);
        Tasks.emitChange();
      }
      break;

    case TaskConstants.TOGGLE_COMPLETE_ALL:
      if (Tasks.areAllComplete()) {
        Tasks.updateAll({complete: false});
      } else {
        Tasks.updateAll({complete: true});
      }
      Tasks.emitChange();
      break;

    case TaskConstants.UNDO_COMPLETE:
      Tasks.update(action.id, {complete: false});
      Tasks.emitChange();
      break;

    case TaskConstants.COMPLETE:
      Tasks.update(action.id, {complete: true});
      Tasks.emitChange();
      break;

    case TaskConstants.UPDATE:
      text = action.text.trim();
      if (text !== '') {
        Tasks.update(action.id, {text: text});
        Tasks.emitChange();
      }
      break;

    case TaskConstants.DESTROY:
      Tasks.destroy(action.id);
      Tasks.emitChange();
      break;

    default:
    // no op
  }
});

export default {
  _isLoaded,
  model: Task,
  collection: TaskCollection
}
