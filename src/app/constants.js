'use strict';

export default {

  TASKS: {
    COMPLETE: 'task:complete',
    CREATE: 'task:create',
    DESTROY: 'task:destroy',
    UNDO_COMPLETE: 'task:undo-complete',
    UPDATE: 'task:update',
    TOGGLE_COMPLETE_ALL: 'tasks:complete-all'
  },

  USER: {
    AUTHENTICATED: 'user:authenticated',
    UNAUTHENTICATED: 'user:unauthenticated'
  },

  FIREBASE: {
    ADDED: 'child_added'
  }

}

