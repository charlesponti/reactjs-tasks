'use strict';

import dispatcher from '../app/dispatcher';
import constants from '../app/constants';
import {EventEmitter} from 'events';
import _ from 'lodash';

let TaskConstants = constants.TASKS;
var CHANGE_EVENT = 'change';

var _tasks = {};

/**
 * Create a new task
 * @param  {string} task
 */
function create(task) {
  task.id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  task.complete = false;
  task.hashtags = TaskStore.parseHashtags(task.description);
  _tasks[task.id] = task;
}

/**
 * Update a TODO item.
 * @param  {string} id
 * @param {object} updates An object literal containing only the data to be
 *     updated.
 */
function update(id, updates) {
  _tasks[id] = _.merge({}, _tasks[id], updates);
}

/**
 * Update all of the TODO items with the same object.
 *     the data to be updated.  Used to mark all TODOs as completed.
 * @param  {object} updates An object literal containing only the data to be
 *     updated.
 */
function updateAll(updates) {
  for (var id in _tasks) {
    update(id, updates);
  }
}

/**
 * Delete a TODO item.
 * @param  {string} id
 */
function destroy(id) {
  delete _tasks[id];
}

/**
 * Delete all the completed TODO items.
 */
function destroyCompleted() {
  for (var id in _tasks) {
    if (_tasks[id].complete) {
      destroy(id);
    }
  }
}

var TaskStore = _.merge({}, EventEmitter.prototype, {

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
    return _tasks;
  },

  toArray() {
    return Object.keys(_tasks).map(id => _tasks[id]);
  },

  /**
   * @description Get store's records filtered on property by value
   * @param  {*} property Property to filter records on
   * @param  {*} value    Value to filter for
   * @return {Array}
   */
  getBy(property, value, not) {
    let tasks = this.toArray();
    if (not)
      return tasks.filter(record => record[property] !== value);
    else
      return tasks.filter(record => record[property] === value);
  },

  getByHashtag(hashtag) {
    return this.toArray().filter(function(task) {
      return ~task.hashtags.indexOf(hashtag);
    });
  },

  /**
   * @description Get hashtags from store's records
   * @returns {Array}
   */
  getHashtags() {
    var hashtags = [];
    //let tasks = Object.keys(_tasks).map(id => _tasks[id]);

    this.toArray().forEach((task)=> {
      if (task.hashtags)
        task.hashtags.forEach((hashtag) => {
          if (!~hashtags.indexOf(hashtag)) hashtags.push(hashtag);
        });
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

// Register callback to handle all updates
dispatcher.register(function(action) {
  let text;

  switch(action.actionType) {
    case TaskConstants.CREATE:
      if (action.data.description !== '') {
        create(action.data);
        TaskStore.emitChange();
      }
      break;

    case TaskConstants.TOGGLE_COMPLETE_ALL:
      if (TaskStore.areAllComplete()) {
        updateAll({complete: false});
      } else {
        updateAll({complete: true});
      }
      TaskStore.emitChange();
      break;

    case TaskConstants.UNDO_COMPLETE:
      update(action.id, {complete: false});
      TaskStore.emitChange();
      break;

    case TaskConstants.COMPLETE:
      update(action.id, {complete: true});
      TaskStore.emitChange();
      break;

    case TaskConstants.UPDATE:
      text = action.text.trim();
      if (text !== '') {
        update(action.id, {text: text});
        TaskStore.emitChange();
      }
      break;

    case TaskConstants.DESTROY:
      destroy(action.id);
      TaskStore.emitChange();
      break;

    default:
    // no op
  }
});

module.exports = TaskStore;
