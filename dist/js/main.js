(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var React = require("react");

// Initialize TouchEvents
React.initializeTouchEvents(true);

var Router = require("react-router");
var App = require("./app");

Router.run(App.routes, function (Handler) {
  React.render(React.createElement(Handler, null), document.querySelector("#app"));
});

// Or, if you'd like to use the HTML5 history API for cleaner URLs:
// Router.run(routes, Router.HistoryLocation, function (Handler) {
//   React.render(<Handler/>, document.querySelector('app'));
// });

},{"./app":5,"react":"react","react-router":"react-router"}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
"use strict";

module.exports = {

  TASKS: {
    COMPLETE: "task-complete",
    CREATE: "task-create",
    DESTROY: "task-destroy",
    TOGGLE_COMPLETE_ALL: "tasks-complete-all",
    UPDATE: "task-update",
    UNDO_COMPLETE: "task-undo-complete"
  }

};

},{}],4:[function(require,module,exports){
"use strict";

var Dispatcher = require("flux").Dispatcher;

module.exports = new Dispatcher();

},{"flux":"flux"}],5:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var dispatcher = _interopRequire(require("./dispatcher"));

var constants = _interopRequire(require("./constants"));

var routes = _interopRequire(require("./routes"));

module.exports = {

  dispatcher: dispatcher,

  constants: constants,

  routes: routes

};

},{"./constants":3,"./dispatcher":4,"./routes":6}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// Components

var App = _interopRequire(require("../pages/app"));

var Home = _interopRequire(require("../pages/home"));

var NotFound = _interopRequire(require("../pages/not-found"));

var TaskPage = _interopRequire(require("../tasks"));

// Dependencies

var React = _interopRequire(require("react"));

var Router = _interopRequire(require("react-router"));

var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

var routes = React.createElement(
  Route,
  { path: "/", handler: App },
  React.createElement(DefaultRoute, { handler: Home }),
  React.createElement(NotFoundRoute, { handler: NotFound }),
  React.createElement(Route, { path: "tasks", handler: TaskPage })
);

module.exports = routes;

},{"../pages/app":7,"../pages/home":8,"../pages/not-found":9,"../tasks":10,"react":"react","react-router":"react-router"}],7:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var RouteHandler = require("react-router").RouteHandler;

var App = (function (_React$Component) {
  function App() {
    _classCallCheck(this, App);

    _get(Object.getPrototypeOf(App.prototype), "constructor", this).call(this);
  }

  _inherits(App, _React$Component);

  _createClass(App, {
    render: {
      value: function render() {
        return React.createElement(
          "div",
          null,
          React.createElement(RouteHandler, null)
        );
      }
    }
  });

  return App;
})(React.Component);

module.exports = App;
/* this is the important part */

},{"react":"react","react-router":"react-router"}],8:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var Home = (function (_React$Component) {
  function Home() {
    _classCallCheck(this, Home);

    _get(Object.getPrototypeOf(Home.prototype), "constructor", this).call(this);
  }

  _inherits(Home, _React$Component);

  _createClass(Home, {
    render: {
      value: function render() {
        return React.createElement(
          "div",
          null,
          React.createElement(
            "h2",
            { className: "text-center" },
            " React Life "
          )
        );
      }
    }
  });

  return Home;
})(React.Component);

module.exports = Home;

},{"react":"react"}],9:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var NotFound = (function (_React$Component) {
  function NotFound() {
    _classCallCheck(this, NotFound);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(NotFound, _React$Component);

  _createClass(NotFound, {
    render: {
      value: function render() {
        return React.createElement(
          "div",
          null,
          React.createElement(
            "h1",
            null,
            " What You Talking About, Willis?"
          )
        );
      }
    }
  });

  return NotFound;
})(React.Component);

module.exports = NotFound;

},{"react":"react"}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var TaskList = _interopRequire(require("./task-list"));

var Tasks = _interopRequire(require("./tasks"));

var TaskForm = _interopRequire(require("./task-form"));

var TaskPage = (function (_React$Component) {
  function TaskPage() {
    _classCallCheck(this, TaskPage);

    _get(Object.getPrototypeOf(TaskPage.prototype), "constructor", this).call(this);
    this.state = {
      tasks: Tasks.getAll()
    };
  }

  _inherits(TaskPage, _React$Component);

  _createClass(TaskPage, {
    _onChange: {
      value: function _onChange() {
        this.setState({ tasks: Tasks.getAll() });
      }
    },
    componentDidMount: {
      value: function componentDidMount() {
        Tasks.addChangeListener(this._onChange.bind(this));
      }
    },
    componentWillUnmount: {
      value: function componentWillUnmount() {
        Tasks.removeChangeListener(this._onChange.bind(this));
      }
    },
    render: {
      value: function render() {
        var _this = this;

        var tasks = Object.keys(this.state.tasks).map(function (key) {
          return _this.state.tasks[key];
        });

        return React.createElement(
          "div",
          { className: "page" },
          React.createElement(
            "h2",
            { className: "text-center" },
            " Tasks "
          ),
          React.createElement(TaskForm, null),
          React.createElement(TaskList, { tasks: tasks })
        );
      }
    }
  });

  return TaskPage;
})(React.Component);

module.exports = TaskPage;

},{"./task-form":11,"./task-list":12,"./tasks":13,"react":"react"}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var tasks = _interopRequire(require("./tasks"));

var dispatcher = _interopRequire(require("../app/dispatcher"));

var constants = _interopRequire(require("../app/constants"));

var TaskForm = (function (_React$Component) {
  function TaskForm() {
    _classCallCheck(this, TaskForm);

    _get(Object.getPrototypeOf(TaskForm.prototype), "constructor", this).call(this);
  }

  _inherits(TaskForm, _React$Component);

  _createClass(TaskForm, {
    onSubmit: {

      /**
       * Handle form submission
       * @param {SyntheticEvent} event
       */

      value: function onSubmit(event) {
        event.preventDefault();
        dispatcher.dispatch({
          actionType: constants.TASKS.CREATE,
          data: {
            description: this.refs.name.getDOMNode().value
          }
        });
      }
    },
    render: {
      value: function render() {
        return React.createElement(
          "section",
          { className: "card" },
          React.createElement(
            "form",
            { className: "task-form", onSubmit: this.onSubmit.bind(this) },
            React.createElement("input", { onKeyUp: this.onKeyUp,
              placeholder: "Search tasks or create new task",
              ref: "name",
              required: true,
              type: "text" })
          )
        );
      }
    }
  });

  return TaskForm;
})(React.Component);

module.exports = TaskForm;

},{"../app/constants":3,"../app/dispatcher":4,"./tasks":13,"react":"react"}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

module.exports = React.createClass({
  displayName: "task-list",

  render: function render() {
    return React.createElement(
      "ul",
      null,
      this.props.tasks.map(function (task) {
        return React.createElement(
          "li",
          { key: task.id, className: "task-list-item" },
          React.createElement("input", { type: "checkbox", value: task.completed }),
          React.createElement(
            "span",
            null,
            task.description
          )
        );
      })
    );
  }

});

},{"react":"react"}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var dispatcher = _interopRequire(require("../app/dispatcher"));

var constants = _interopRequire(require("../app/constants"));

var EventEmitter = require("events").EventEmitter;

var _ = _interopRequire(require("lodash"));

var TaskConstants = constants.TASKS;
var CHANGE_EVENT = "change";

var _tasks = {};

/**
 * Create a new task
 * @param  {string} task
 */
function create(task) {
  task.id = (+new Date() + Math.floor(Math.random() * 999999)).toString(36);
  task.complete = false;
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
  areAllComplete: function areAllComplete() {
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
  getAll: function getAll() {
    return _tasks;
  },

  emitChange: function emitChange() {
    this.emit(CHANGE_EVENT);
  },

  /**
   * @param {function} callback
   */
  addChangeListener: function addChangeListener(callback) {
    this.on(CHANGE_EVENT, callback);
  },

  /**
   * @param {function} callback
   */
  removeChangeListener: function removeChangeListener(callback) {
    this.removeListener(CHANGE_EVENT, callback);
  }

});

// Register callback to handle all updates
dispatcher.register(function (action) {
  var text = undefined;

  switch (action.actionType) {
    case TaskConstants.CREATE:
      if (action.data.description !== "") {
        create(action.data);
        TaskStore.emitChange();
      }
      break;

    case TaskConstants.TOGGLE_COMPLETE_ALL:
      if (TaskStore.areAllComplete()) {
        updateAll({ complete: false });
      } else {
        updateAll({ complete: true });
      }
      TaskStore.emitChange();
      break;

    case TaskConstants.UNDO_COMPLETE:
      update(action.id, { complete: false });
      TaskStore.emitChange();
      break;

    case TaskConstants.COMPLETE:
      update(action.id, { complete: true });
      TaskStore.emitChange();
      break;

    case TaskConstants.UPDATE:
      text = action.text.trim();
      if (text !== "") {
        update(action.id, { text: text });
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

},{"../app/constants":3,"../app/dispatcher":4,"events":2,"lodash":"lodash"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL21haW4uanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYXBwL2NvbnN0YW50cy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYXBwL2Rpc3BhdGNoZXIuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FwcC9pbmRleC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYXBwL3JvdXRlcy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvcGFnZXMvYXBwLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9ob21lLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9ub3QtZm91bmQuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3Rhc2tzL2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy90YXNrLWZvcm0uanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3Rhc2tzL3Rhc2stbGlzdC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvdGFza3MvdGFza3MuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7O0FBRWIsSUFBSSxLQUFLLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOzs7QUFHN0IsS0FBSyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVsQyxJQUFJLE1BQU0sR0FBRyxPQUFPLENBQUMsY0FBYyxDQUFDLENBQUM7QUFDckMsSUFBSSxHQUFHLEdBQUcsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUUzQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxPQUFPLEVBQUU7QUFDeEMsT0FBSyxDQUFDLE1BQU0sQ0FBQyxvQkFBQyxPQUFPLE9BQUUsRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Q0FDMUQsQ0FBQyxDQUFDOzs7Ozs7OztBQ1pIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUEsQUFFUixTQUFLLGFBQWEsQ0FBQyxRQUFRO0FBQ3pCLFlBQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUMsUUFBUSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7QUFDcEMsZUFBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3ZCLFlBQU07O0FBQUEsQUFFUixTQUFLLGFBQWEsQ0FBQyxNQUFNO0FBQ3ZCLFVBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzFCLFVBQUksSUFBSSxLQUFLLEVBQUUsRUFBRTtBQUNmLGNBQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUMsSUFBSSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUM7QUFDaEMsaUJBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztPQUN4QjtBQUNELFlBQU07O0FBQUEsQUFFUixTQUFLLGFBQWEsQ0FBQyxPQUFPO0FBQ3hCLGFBQU8sQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDbkIsZUFBUyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3ZCLFlBQU07O0FBQUEsQUFFUixZQUFROztHQUVUO0NBQ0YsQ0FBQyxDQUFDOztBQUVILE1BQU0sQ0FBQyxPQUFPLEdBQUcsU0FBUyxDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxuLy8gSW5pdGlhbGl6ZSBUb3VjaEV2ZW50c1xuUmVhY3QuaW5pdGlhbGl6ZVRvdWNoRXZlbnRzKHRydWUpO1xuXG52YXIgUm91dGVyID0gcmVxdWlyZSgncmVhY3Qtcm91dGVyJyk7XG52YXIgQXBwID0gcmVxdWlyZSgnLi9hcHAnKTtcblxuUm91dGVyLnJ1bihBcHAucm91dGVzLCBmdW5jdGlvbiAoSGFuZGxlcikge1xuICBSZWFjdC5yZW5kZXIoPEhhbmRsZXIvPiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FwcCcpKTtcbn0pO1xuXG4vLyBPciwgaWYgeW91J2QgbGlrZSB0byB1c2UgdGhlIEhUTUw1IGhpc3RvcnkgQVBJIGZvciBjbGVhbmVyIFVSTHM6XG4vLyBSb3V0ZXIucnVuKHJvdXRlcywgUm91dGVyLkhpc3RvcnlMb2NhdGlvbiwgZnVuY3Rpb24gKEhhbmRsZXIpIHtcbi8vICAgUmVhY3QucmVuZGVyKDxIYW5kbGVyLz4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FwcCcpKTtcbi8vIH0pO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgVEFTS1M6IHtcbiAgICBDT01QTEVURTogJ3Rhc2stY29tcGxldGUnLFxuICAgIENSRUFURTogJ3Rhc2stY3JlYXRlJyxcbiAgICBERVNUUk9ZOiAndGFzay1kZXN0cm95JyxcbiAgICBUT0dHTEVfQ09NUExFVEVfQUxMOiAndGFza3MtY29tcGxldGUtYWxsJyxcbiAgICBVUERBVEU6ICd0YXNrLXVwZGF0ZScsXG4gICAgVU5ET19DT01QTEVURTogJ3Rhc2stdW5kby1jb21wbGV0ZSdcbiAgfVxuXG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRGlzcGF0Y2hlcigpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXInO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgcm91dGVzIGZyb20gJy4vcm91dGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIGRpc3BhdGNoZXI6IGRpc3BhdGNoZXIsXG5cbiAgY29uc3RhbnRzOiBjb25zdGFudHMsXG5cbiAgcm91dGVzOiByb3V0ZXNcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IEFwcCBmcm9tICcuLi9wYWdlcy9hcHAnO1xuaW1wb3J0IEhvbWUgZnJvbSAnLi4vcGFnZXMvaG9tZSc7XG5pbXBvcnQgTm90Rm91bmQgZnJvbSAnLi4vcGFnZXMvbm90LWZvdW5kJztcbmltcG9ydCBUYXNrUGFnZSBmcm9tICcuLi90YXNrcyc7XG5cbi8vIERlcGVuZGVuY2llc1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSb3V0ZXIgZnJvbSAncmVhY3Qtcm91dGVyJztcblxubGV0IFJvdXRlICA9IFJvdXRlci5Sb3V0ZTtcbmxldCBEZWZhdWx0Um91dGUgPSBSb3V0ZXIuRGVmYXVsdFJvdXRlO1xubGV0IE5vdEZvdW5kUm91dGUgPSBSb3V0ZXIuTm90Rm91bmRSb3V0ZTtcblxudmFyIHJvdXRlcyA9IChcbiAgPFJvdXRlIHBhdGg9XCIvXCIgaGFuZGxlcj17QXBwfT5cbiAgICA8RGVmYXVsdFJvdXRlIGhhbmRsZXI9e0hvbWV9IC8+XG4gICAgPE5vdEZvdW5kUm91dGUgaGFuZGxlcj17Tm90Rm91bmR9Lz5cbiAgICA8Um91dGUgcGF0aD1cInRhc2tzXCIgaGFuZGxlcj17VGFza1BhZ2V9IC8+XG4gIDwvUm91dGU+XG4pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1JvdXRlSGFuZGxlcn0gZnJvbSAncmVhY3Qtcm91dGVyJztcblxuY2xhc3MgQXBwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7LyogdGhpcyBpcyB0aGUgaW1wb3J0YW50IHBhcnQgKi99XG4gICAgICAgIDxSb3V0ZUhhbmRsZXIvPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jbGFzcyBIb21lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj4gUmVhY3QgTGlmZSA8L2gyPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgSG9tZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY2xhc3MgTm90Rm91bmQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGgxPiBXaGF0IFlvdSBUYWxraW5nIEFib3V0LCBXaWxsaXM/PC9oMT5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IE5vdEZvdW5kO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFRhc2tMaXN0IGZyb20gJy4vdGFzay1saXN0JztcbmltcG9ydCBUYXNrcyBmcm9tICcuL3Rhc2tzJztcbmltcG9ydCBUYXNrRm9ybSBmcm9tICcuL3Rhc2stZm9ybSc7XG5cbmNsYXNzIFRhc2tQYWdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICB0YXNrczogVGFza3MuZ2V0QWxsKClcbiAgICB9O1xuICB9XG5cbiAgX29uQ2hhbmdlKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoeyB0YXNrczogVGFza3MuZ2V0QWxsKCkgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICBUYXNrcy5hZGRDaGFuZ2VMaXN0ZW5lcih0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIFRhc2tzLnJlbW92ZUNoYW5nZUxpc3RlbmVyKHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCB0YXNrcyA9IE9iamVjdC5rZXlzKHRoaXMuc3RhdGUudGFza3MpLm1hcCgoa2V5KSA9PiB7XG4gICAgICByZXR1cm4gdGhpcy5zdGF0ZS50YXNrc1trZXldO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXYgY2xhc3NOYW1lPVwicGFnZVwiPlxuICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj4gVGFza3MgPC9oMj5cbiAgICAgICAgPFRhc2tGb3JtIC8+XG4gICAgICAgIDxUYXNrTGlzdCB0YXNrcz17dGFza3N9Lz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBUYXNrUGFnZTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB0YXNrcyBmcm9tICcuL3Rhc2tzJztcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4uL2FwcC9kaXNwYXRjaGVyJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vYXBwL2NvbnN0YW50cyc7XG5cbmNsYXNzIFRhc2tGb3JtIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBmb3JtIHN1Ym1pc3Npb25cbiAgICogQHBhcmFtIHtTeW50aGV0aWNFdmVudH0gZXZlbnRcbiAgICovXG4gIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IGNvbnN0YW50cy5UQVNLUy5DUkVBVEUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnJlZnMubmFtZS5nZXRET01Ob2RlKCkudmFsdWVcbiAgICAgIH1cbiAgICB9KVxuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJjYXJkXCI+XG4gICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cInRhc2stZm9ybVwiIG9uU3VibWl0PXt0aGlzLm9uU3VibWl0LmJpbmQodGhpcyl9PlxuICAgICAgICAgIDxpbnB1dCBvbktleVVwPXt0aGlzLm9uS2V5VXB9XG4gICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VhcmNoIHRhc2tzIG9yIGNyZWF0ZSBuZXcgdGFza1wiXG4gICAgICAgICAgICAgICAgIHJlZj1cIm5hbWVcIlxuICAgICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiIC8+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICApO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGFza0Zvcm07XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8dWw+XG4gICAgICAgIHt0aGlzLnByb3BzLnRhc2tzLm1hcCgodGFzaykgPT4ge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8bGkga2V5PXt0YXNrLmlkfSBjbGFzc05hbWU9XCJ0YXNrLWxpc3QtaXRlbVwiPlxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9e3Rhc2suY29tcGxldGVkfSAvPlxuICAgICAgICAgICAgICA8c3Bhbj57dGFzay5kZXNjcmlwdGlvbn08L3NwYW4+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICk7XG4gICAgICAgIH0pfVxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlcic7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uL2FwcC9jb25zdGFudHMnO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gJ2V2ZW50cyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuXG5sZXQgVGFza0NvbnN0YW50cyA9IGNvbnN0YW50cy5UQVNLUztcbnZhciBDSEFOR0VfRVZFTlQgPSAnY2hhbmdlJztcblxudmFyIF90YXNrcyA9IHt9O1xuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyB0YXNrXG4gKiBAcGFyYW0gIHtzdHJpbmd9IHRhc2tcbiAqL1xuZnVuY3Rpb24gY3JlYXRlKHRhc2spIHtcbiAgdGFzay5pZCA9ICgrbmV3IERhdGUoKSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDk5OTk5OSkpLnRvU3RyaW5nKDM2KTtcbiAgdGFzay5jb21wbGV0ZSA9IGZhbHNlO1xuICBfdGFza3NbdGFzay5pZF0gPSB0YXNrO1xufVxuXG4vKipcbiAqIFVwZGF0ZSBhIFRPRE8gaXRlbS5cbiAqIEBwYXJhbSAge3N0cmluZ30gaWRcbiAqIEBwYXJhbSB7b2JqZWN0fSB1cGRhdGVzIEFuIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5pbmcgb25seSB0aGUgZGF0YSB0byBiZVxuICogICAgIHVwZGF0ZWQuXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZShpZCwgdXBkYXRlcykge1xuICBfdGFza3NbaWRdID0gXy5tZXJnZSh7fSwgX3Rhc2tzW2lkXSwgdXBkYXRlcyk7XG59XG5cbi8qKlxuICogVXBkYXRlIGFsbCBvZiB0aGUgVE9ETyBpdGVtcyB3aXRoIHRoZSBzYW1lIG9iamVjdC5cbiAqICAgICB0aGUgZGF0YSB0byBiZSB1cGRhdGVkLiAgVXNlZCB0byBtYXJrIGFsbCBUT0RPcyBhcyBjb21wbGV0ZWQuXG4gKiBAcGFyYW0gIHtvYmplY3R9IHVwZGF0ZXMgQW4gb2JqZWN0IGxpdGVyYWwgY29udGFpbmluZyBvbmx5IHRoZSBkYXRhIHRvIGJlXG4gKiAgICAgdXBkYXRlZC5cbiAqL1xuZnVuY3Rpb24gdXBkYXRlQWxsKHVwZGF0ZXMpIHtcbiAgZm9yICh2YXIgaWQgaW4gX3Rhc2tzKSB7XG4gICAgdXBkYXRlKGlkLCB1cGRhdGVzKTtcbiAgfVxufVxuXG4vKipcbiAqIERlbGV0ZSBhIFRPRE8gaXRlbS5cbiAqIEBwYXJhbSAge3N0cmluZ30gaWRcbiAqL1xuZnVuY3Rpb24gZGVzdHJveShpZCkge1xuICBkZWxldGUgX3Rhc2tzW2lkXTtcbn1cblxuLyoqXG4gKiBEZWxldGUgYWxsIHRoZSBjb21wbGV0ZWQgVE9ETyBpdGVtcy5cbiAqL1xuZnVuY3Rpb24gZGVzdHJveUNvbXBsZXRlZCgpIHtcbiAgZm9yICh2YXIgaWQgaW4gX3Rhc2tzKSB7XG4gICAgaWYgKF90YXNrc1tpZF0uY29tcGxldGUpIHtcbiAgICAgIGRlc3Ryb3koaWQpO1xuICAgIH1cbiAgfVxufVxuXG52YXIgVGFza1N0b3JlID0gXy5tZXJnZSh7fSwgRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwge1xuXG4gIC8qKlxuICAgKiBUZXN0cyB3aGV0aGVyIGFsbCB0aGUgcmVtYWluaW5nIFRPRE8gaXRlbXMgYXJlIG1hcmtlZCBhcyBjb21wbGV0ZWQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBhcmVBbGxDb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaWQgaW4gX3Rhc2tzKSB7XG4gICAgICBpZiAoIV90YXNrc1tpZF0uY29tcGxldGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0IHRoZSBlbnRpcmUgY29sbGVjdGlvbiBvZiBUT0RPcy5cbiAgICogQHJldHVybiB7b2JqZWN0fVxuICAgKi9cbiAgZ2V0QWxsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gX3Rhc2tzO1xuICB9LFxuXG4gIGVtaXRDaGFuZ2U6IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZW1pdChDSEFOR0VfRVZFTlQpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgKi9cbiAgYWRkQ2hhbmdlTGlzdGVuZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5vbihDSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICovXG4gIHJlbW92ZUNoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIoQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH1cblxufSk7XG5cbi8vIFJlZ2lzdGVyIGNhbGxiYWNrIHRvIGhhbmRsZSBhbGwgdXBkYXRlc1xuZGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihhY3Rpb24pIHtcbiAgbGV0IHRleHQ7XG5cbiAgc3dpdGNoKGFjdGlvbi5hY3Rpb25UeXBlKSB7XG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLkNSRUFURTpcbiAgICAgIGlmIChhY3Rpb24uZGF0YS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgY3JlYXRlKGFjdGlvbi5kYXRhKTtcbiAgICAgICAgVGFza1N0b3JlLmVtaXRDaGFuZ2UoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLlRPR0dMRV9DT01QTEVURV9BTEw6XG4gICAgICBpZiAoVGFza1N0b3JlLmFyZUFsbENvbXBsZXRlKCkpIHtcbiAgICAgICAgdXBkYXRlQWxsKHtjb21wbGV0ZTogZmFsc2V9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHVwZGF0ZUFsbCh7Y29tcGxldGU6IHRydWV9KTtcbiAgICAgIH1cbiAgICAgIFRhc2tTdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgVGFza0NvbnN0YW50cy5VTkRPX0NPTVBMRVRFOlxuICAgICAgdXBkYXRlKGFjdGlvbi5pZCwge2NvbXBsZXRlOiBmYWxzZX0pO1xuICAgICAgVGFza1N0b3JlLmVtaXRDaGFuZ2UoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLkNPTVBMRVRFOlxuICAgICAgdXBkYXRlKGFjdGlvbi5pZCwge2NvbXBsZXRlOiB0cnVlfSk7XG4gICAgICBUYXNrU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuVVBEQVRFOlxuICAgICAgdGV4dCA9IGFjdGlvbi50ZXh0LnRyaW0oKTtcbiAgICAgIGlmICh0ZXh0ICE9PSAnJykge1xuICAgICAgICB1cGRhdGUoYWN0aW9uLmlkLCB7dGV4dDogdGV4dH0pO1xuICAgICAgICBUYXNrU3RvcmUuZW1pdENoYW5nZSgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuREVTVFJPWTpcbiAgICAgIGRlc3Ryb3koYWN0aW9uLmlkKTtcbiAgICAgIFRhc2tTdG9yZS5lbWl0Q2hhbmdlKCk7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgLy8gbm8gb3BcbiAgfVxufSk7XG5cbm1vZHVsZS5leHBvcnRzID0gVGFza1N0b3JlO1xuIl19
