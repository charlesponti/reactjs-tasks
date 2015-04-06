'use strict';

import dispatcher from '../app/dispatcher';
import constants from '../app/constants';
import {EventEmitter} from 'events';
import _ from 'lodash';

let TaskConstants = constants.TASKS;
var CHANGE_EVENT = 'change';

var _tasks = {};

/**
 * Create a TODO item.
 * @param  {string} text The content of the TODO
 */
function create(text) {
  // Hand waving here -- not showing how this interacts with XHR or persistent
  // server-side storage.
  // Using the current timestamp + random number in place of a real id.
  var id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  _tasks[id] = {
    id: id,
    complete: false,
    text: text
  };
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
      text = action.text.trim();
      if (text !== '') {
        create(text);
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
