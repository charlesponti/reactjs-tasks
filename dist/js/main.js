(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

window.Parse.initialize("D1yUthHcRNvTyamye2wRzqAbzS2gB5oXO19eXe8L", "0oeaJSgscprh9SHGDZGifwQxqNrnn4CDgwOmDssM");

var React = _interopRequire(require("react"));

var Router = _interopRequire(require("react-router"));

var App = _interopRequire(require("./app"));

// Initialize TouchEvents
React.initializeTouchEvents(true);

Router.run(App.routes, function (Handler) {
  React.render(React.createElement(Handler, null), document.querySelector("#app"));
});

},{"./app":8,"react":"react","react-router":"react-router"}],2:[function(require,module,exports){
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

var React = require("react");

module.exports = React.createClass({
  displayName: "exports",

  onSubmit: function onSubmit(event) {
    event.preventDefault();
  },

  render: function render() {
    return React.createElement(
      "form",
      { onSubmit: this.onSubmit },
      React.createElement("input", { type: "text", name: "activity.name", ref: "name" }),
      React.createElement(
        "button",
        null,
        " Start Tracking "
      )
    );
  }

});

},{"react":"react"}],4:[function(require,module,exports){
"use strict";

var React = require("react");

module.exports = React.createClass({
  displayName: "exports",

  render: function render() {
    return React.createElement("ul", null);
  }

});

},{"react":"react"}],5:[function(require,module,exports){
"use strict";

var React = require("react");
var ActivityForm = require("./activity-form");
var ActivityList = require("./activity-list");

module.exports = React.createClass({
  displayName: "exports",

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "h3",
        { className: "text-center" },
        " Activity "
      ),
      React.createElement(ActivityForm, null),
      React.createElement(ActivityList, null)
    );
  }

});

},{"./activity-form":3,"./activity-list":4,"react":"react"}],6:[function(require,module,exports){
"use strict";

module.exports = {

  TASKS: {
    COMPLETE: "task:complete",
    CREATE: "task:create",
    DESTROY: "task:destroy",
    EDIT: "task:edit",
    UNDO_COMPLETE: "task:undo-complete",
    UPDATE: "task:update",
    TOGGLE_COMPLETE_ALL: "tasks:complete-all"
  },

  USER: {
    AUTHENTICATED: "user:authenticated",
    UNAUTHENTICATED: "user:unauthenticated"
  },

  FIREBASE: {
    ADDED: "child_added"
  }

};

},{}],7:[function(require,module,exports){
"use strict";

var Dispatcher = require("flux").Dispatcher;

module.exports = new Dispatcher();

},{"flux":"flux"}],8:[function(require,module,exports){
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

},{"./constants":6,"./dispatcher":7,"./routes":9}],9:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// Components

var App = _interopRequire(require("../pages/app"));

var Home = _interopRequire(require("../pages/home"));

var NotFound = _interopRequire(require("../pages/not-found"));

var TaskPage = _interopRequire(require("../tasks"));

var ActivityPage = _interopRequire(require("../activity"));

var SignUpPage = _interopRequire(require("../pages/sign-up.js"));

// Dependencies

var React = _interopRequire(require("react"));

var Router = _interopRequire(require("react-router"));

var routes = undefined;
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

if (Parse.User.current()) {
  routes = React.createElement(
    Route,
    { path: "/", handler: App },
    React.createElement(DefaultRoute, { handler: Home }),
    React.createElement(NotFoundRoute, { handler: NotFound }),
    React.createElement(Route, { path: "tasks", handler: TaskPage }),
    React.createElement(Route, { path: "activity", handler: ActivityPage })
  );
} else {
  routes = React.createElement(
    Route,
    { path: "/", handler: App },
    React.createElement(DefaultRoute, { handler: SignUpPage }),
    React.createElement(NotFoundRoute, { handler: NotFound })
  );
}

module.exports = routes;

},{"../activity":5,"../pages/app":10,"../pages/home":11,"../pages/not-found":12,"../pages/sign-up.js":13,"../tasks":15,"react":"react","react-router":"react-router"}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var RouteHandler = require("react-router").RouteHandler;

var dispatcher = _interopRequire(require("../app/dispatcher"));

module.exports = React.createClass({
  displayName: "app",

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(RouteHandler, null)
    );
  }

});
/* this is the important part */

},{"../app/dispatcher":7,"react":"react","react-router":"react-router"}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var SignUp = _interopRequire(require("./sign-up.js"));

module.exports = React.createClass({
  displayName: "home",

  getInitialState: function getInitialState() {
    return {
      authenticated: Parse.User.current()
    };
  },

  connectDropbox: function connectDropbox() {
    if (!this.state.authenticated) {}
  },

  render: function render() {
    var markup = undefined;

    if (!this.state.authenticated) {
      markup = React.createElement(SignUp, null);
    } else {
      markup = React.createElement(
        "button",
        null,
        React.createElement(
          "a",
          { href: "#/tasks" },
          "Tasks"
        )
      );
    }

    return React.createElement(
      "section",
      { className: "text-center home" },
      markup
    );
  }

});

},{"./sign-up.js":13,"react":"react"}],12:[function(require,module,exports){
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

},{"react":"react"}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var SignUp = React.createClass({
  displayName: "SignUp",

  getInitialState: function getInitialState() {
    return {
      user: new Parse.User()
    };
  },

  onSubmit: function onSubmit(event) {
    event.preventDefault();
    var email = this.refs.email.getDOMNode().value;
    var password = this.refs.password.getDOMNode().value;
    var passwordConfirmation = this.refs.passwordConfirmation.getDOMNode().value;
    var allValues = email && password && passwordConfirmation;
    var matchingPasswords = password === passwordConfirmation;

    if (allValues && matchingPasswords) {
      this.state.user.set("username", email);
      this.state.user.set("password", password);

      this.state.user.signUp(null, {
        success: function success(user) {
          console.log(user);
        },
        error: (function (_error) {
          var _errorWrapper = function error(_x, _x2) {
            return _error.apply(this, arguments);
          };

          _errorWrapper.toString = function () {
            return _error.toString();
          };

          return _errorWrapper;
        })(function (user, error) {
          // Show the error message somewhere and let the user try again.
          alert("Error: " + error.code + " " + error.message);
        })
      });
    }
  },

  render: function render() {
    return React.createElement(
      "form",
      { onSubmit: this.onSubmit },
      React.createElement("input", { ref: "email", type: "email", placeholder: " Email Address" }),
      React.createElement("br", null),
      React.createElement("input", { ref: "password", type: "password", placeholder: " Password" }),
      React.createElement("br", null),
      React.createElement("input", { ref: "passwordConfirmation", type: "password", placeholder: " Password Confirmation" }),
      React.createElement("br", null),
      React.createElement(
        "button",
        null,
        " Sign Up "
      )
    );
  }

});

module.exports = SignUp;

},{"react":"react"}],14:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var dispatcher = _interopRequire(require("../app/dispatcher"));

module.exports = React.createClass({
  displayName: "hashtags",

  getInitialState: function getInitialState() {
    return {};
  },

  _onClick: function _onClick(hashtag) {
    // Check if hashtag is same as currently selected
    var isSelected = this.state.selected === hashtag;

    // Set selected hashtag to state
    this.setState({ selected: hashtag });

    // Dispatch search by hashtag
    dispatcher.dispatch({
      actionType: "search:hashtag",
      data: isSelected ? undefined : hashtag
    });
  },

  render: function render() {
    var _this = this;

    return React.createElement(
      "ul",
      { className: "task-hashtags-list" },
      this.props.hashtags.map(function (hashTag) {
        return React.createElement(
          "li",
          { key: hashTag,
            className: { selected: _this.state.selected === hashTag } },
          React.createElement(
            "a",
            { onClick: _this._onClick.bind(_this, hashTag) },
            { hashTag: hashTag }
          )
        );
      })
    );
  }

});

},{"../app/dispatcher":7,"react":"react"}],15:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var TaskList = _interopRequire(require("./task-list"));

var Tasks = _interopRequire(require("./store"));

var TaskForm = _interopRequire(require("./task-form"));

var Hashtags = _interopRequire(require("./hashtags"));

var dispatcher = _interopRequire(require("../app/dispatcher"));

var TaskPage = (function (_React$Component) {
  function TaskPage() {
    _classCallCheck(this, TaskPage);

    _get(Object.getPrototypeOf(TaskPage.prototype), "constructor", this).call(this);
    this.state = {
      loaded: Tasks._isLoaded,
      tasks: Tasks._isLoaded ? Tasks.collection.models : []
    };
  }

  _inherits(TaskPage, _React$Component);

  _createClass(TaskPage, {
    _onChange: {
      value: function _onChange() {
        this.setState({ tasks: Tasks.collection.models });
      }
    },
    componentWillMount: {
      value: function componentWillMount() {
        var _this = this;

        Tasks.collection.load().then(function (tasks) {
          return _this.setState({
            loaded: true,
            tasks: tasks
          });
        });
      }
    },
    componentDidMount: {
      value: function componentDidMount() {
        var _this = this;

        // Register with app dispatcher
        this.token = dispatcher.register(function (payload) {
          switch (payload.actionType) {
            case "search:hashtag":
              _this.setState({
                tasks: Tasks.getByHashtag(payload.data)
              });
              break;
            case "tasks:load":
              _this.setState({
                loaded: true,
                tasks: Tasks.table.query()
              });
              break;
          }
        });

        // Watch for changes to Tasks
        Tasks.collection.on("change", this._onChange.bind(this));
      }
    },
    componentWillUnmount: {
      value: function componentWillUnmount() {
        // Unregister from app dispatcher
        dispatcher.unregister(this.token);
        // Unwatch for changes to Tasks
        Tasks.collection.on("change", this._onChange.bind(this));
      }
    },
    render: {
      value: function render() {
        var tasks = this.state.tasks;

        var hashtags = this.state.loaded ? Tasks.collection.getHashtags() : [];

        return React.createElement(
          "div",
          { className: "page" },
          React.createElement(
            "h4",
            { className: "text-center" },
            " Tasks "
          ),
          React.createElement(Hashtags, { hashtags: hashtags }),
          React.createElement(TaskForm, null),
          this.state.loaded ? React.createElement(TaskList, { tasks: tasks }) : React.createElement(
            "div",
            { className: "text-center" },
            React.createElement("i", { className: "fa fa-spinner fa-spin fa-2x" })
          )
        );
      }
    }
  });

  return TaskPage;
})(React.Component);

module.exports = TaskPage;

},{"../app/dispatcher":7,"./hashtags":14,"./store":16,"./task-form":17,"./task-list":18,"react":"react"}],16:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var EventEmitter = require("events").EventEmitter;

var dispatcher = _interopRequire(require("../app/dispatcher.js"));

var constants = _interopRequire(require("../app/constants.js"));

var _ = _interopRequire(require("lodash"));

/**
 * Reference to this file's module
 * @type {{}}
 */
var Tasks = {};

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

var TaskConstants = constants.TASKS;
var CHANGE_EVENT = "change";

/**
 * Model for tasks
 */
var Task = Parse.Object.extend("TaskObject", {

  getHashtags: function getHashtags() {
    return this.get("hashtags") || [];
  }

});

/**
 * Collection for taskss
 * @type {Selection.extend}
 */
var TaskCollection = Parse.Collection.extend(_.merge({

  // Set model of collection
  model: Task,

  /**
   * True if store has been loaded, false if it has not
   * @type {boolean}
   */
  isLoaded: false,

  load: function load() {
    var query = new Parse.Query(this.model);
    query.equalTo("user", Parse.User.current().id);
    return new Promise(function (resolve, reject) {
      return query.find({
        success: function (tasks) {
          Tasks.collection.add(tasks);
          Tasks.isLoaded = true;
          return resolve(tasks);
        },
        error: function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          return reject.apply(undefined, args);
        }
      });
    });
  },

  /**
   * Create a new task
   * @param  {string} task
   */
  addTask: function addTask(task) {
    task.complete = false;

    // Get hashtags from description
    task.hashtags = Tasks.collection.parseHashtags(task.description);

    // Set current user's id to task
    task.user = Parse.User.current().id;

    // POST task to Parse API
    this.create(task, {
      success: function success(response) {
        response.collection.emitChange();
      },
      error: function error() {
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
  update: function update(id, updates) {
    var task = this.table.query({ id: id })[0];
    if (task) {
      return Object.keys(updates).forEach(function (key) {
        return task.set(key, updates[key]);
      });
    } else {
      return console.warn("Task " + id + " could not be found");
    }
  },

  /**
   * Update all of the TODO items with the same object.
   *     the data to be updated.  Used to mark all TODOs as completed.
   * @param  {object} updates An object literal containing only the data to be
   *     updated.
   */
  updateAll: function updateAll(updates) {
    var tasks = this.table.query();
    return tasks.forEach(function (task) {
      TaskCollection.update(task.get("id"), updates);
    });
  },

  /**
   * Delete a TODO item.
   * @param  {string} id
   */
  destroy: function destroy(id) {
    delete _tasks[id];
  },

  /**
   * Delete all the completed TODO items.
   */
  destroyCompleted: function destroyCompleted() {
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
    return this.table.query();
  },

  /**
   * @description Get store's records filtered on property by value
   * @param  {*} property Property to filter records on
   * @param  {*} value    Value to filter for
   * @return {Array}
   */
  getBy: function getBy(property, value, not) {
    var tasks = this.table.query();
    if (not) {
      return tasks.filter(function (record) {
        return record[property] !== value;
      });
    } else {
      return tasks.filter(function (record) {
        return record[property] === value;
      });
    }
  },

  getByHashtag: function getByHashtag(hashtag) {
    return Tasks.collection.models.filter(function (task) {
      var tags = task.get("hashtags");
      return tags.length() && ~tags.toArray().indexOf(hashtag);
    });
  },

  /**
   * @description Get hashtags from store's records
   * @returns {Array}
   */
  getHashtags: function getHashtags() {
    return Tasks.collection.models.filter(function (task) {
      return task.getHashtags().length;
    }).map(function (task) {
      return task.get("hashtags");
    });
  },

  /**
   * @description Get array of hashtags from text
   * @param  {String} text Text to search for hashtags
   * @return {Array}      List of hashtags
   */
  parseHashtags: function parseHashtags(text) {
    return text.match(/(#[a-z\d][\w-]*)/ig) || [];
  },

  emitChange: function emitChange() {
    this.trigger(CHANGE_EVENT);
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

}));

// Register callback to handle all updates
dispatcher.register(function (action) {
  var text = undefined;
  var collection = Tasks.collection;

  switch (action.actionType) {
    case TaskConstants.CREATE:
      if (action.data.description !== "") {
        collection.addTask(action.data);
        collection.emitChange();
      }
      break;

    case TaskConstants.TOGGLE_COMPLETE_ALL:
      if (Tasks.areAllComplete()) {
        collection.updateAll({ complete: false });
      } else {
        collection.updateAll({ complete: true });
      }
      collection.emitChange();
      break;

    case TaskConstants.UNDO_COMPLETE:
      collection.update(action.id, { complete: false });
      collection.emitChange();
      break;

    case TaskConstants.COMPLETE:
      collection.update(action.id, { complete: true });
      collection.emitChange();
      break;

    case TaskConstants.UPDATE:
      text = action.text.trim();
      if (text !== "") {
        collection.update(action.id, { text: text });
        collection.emitChange();
      }
      break;

    case TaskConstants.DESTROY:
      action.data.destroy({
        success: function success(object) {
          collection.emitChange();
        },
        error: function error(object, err) {
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

module.exports = Tasks;

},{"../app/constants.js":6,"../app/dispatcher.js":7,"events":2,"lodash":"lodash"}],17:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var dispatcher = _interopRequire(require("../app/dispatcher"));

var constants = _interopRequire(require("../app/constants"));

module.exports = React.createClass({
  displayName: "task-form",

  getInitialState: function getInitialState() {
    return {};
  },

  componentWillMount: function componentWillMount() {
    var _this = this;

    this.dispatchToken = dispatcher.register(function (payload) {
      switch (payload.actionType) {
        case constants.TASKS.EDIT:
          _this.setState({
            value: payload.data.get("description")
          });
      }
    });
  },

  componentWillUnmount: function componentWillUnmount() {
    // Unregister from app dispatcher
    dispatcher.unregister(this.dispatchToken);
  },

  /**
   * Handle form submission
   * @param {SyntheticEvent} event
   */
  onSubmit: function onSubmit(event) {
    event.preventDefault();

    // Empty input value
    this.setState({ value: "" });

    // Dispatch task creation event
    dispatcher.dispatch({
      actionType: constants.TASKS.CREATE,
      data: {
        description: this.refs.name.getDOMNode().value
      }
    });
  },

  /**
   * Set value of input field to state.value on change
   */
  onChange: function onChange() {
    this.setState({ value: this.refs.name.getDOMNode().value });
  },

  render: function render() {
    return React.createElement(
      "section",
      { className: "card" },
      React.createElement(
        "form",
        { className: "task-form", onSubmit: this.onSubmit },
        React.createElement("input", { onChange: this.onChange,
          placeholder: "Search tasks or create new task",
          ref: "name",
          required: true,
          type: "text",
          value: this.state.value })
      )
    );
  }

});

},{"../app/constants":6,"../app/dispatcher":7,"react":"react"}],18:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var dispatcher = _interopRequire(require("../app/dispatcher.js"));

var constants = _interopRequire(require("../app/constants.js"));

module.exports = React.createClass({
  displayName: "task-list",

  onEditClick: function onEditClick(task) {
    dispatcher.dispatch({
      actionType: constants.TASKS.EDIT,
      data: task
    });
  },

  /**
   * Delete task
   * @param {child} task
   */
  onDeleteClick: function onDeleteClick(task) {
    dispatcher.dispatch({
      actionType: constants.TASKS.DESTROY,
      data: task
    });
  },

  render: function render() {
    var _this = this;

    var tasks = this.props.tasks || [];

    return React.createElement(
      "ul",
      { className: "task-list" },
      tasks.map(function (task) {
        return React.createElement(
          "li",
          { key: task.get("objectId"), className: "task-list-item card" },
          React.createElement("input", { type: "checkbox", value: task.completed }),
          React.createElement(
            "span",
            null,
            task.get("description")
          ),
          React.createElement(
            "div",
            { className: "pull-right" },
            React.createElement("i", { className: "fa fa-edit", onClick: _this.onEditClick.bind(_this, task) }),
            React.createElement("i", { className: "fa fa-close", onClick: _this.onDeleteClick.bind(_this, task) })
          )
        );
      })
    );
  }

});

},{"../app/constants.js":6,"../app/dispatcher.js":7,"react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL21haW4uanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYWN0aXZpdHkvYWN0aXZpdHktZm9ybS5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYWN0aXZpdHkvYWN0aXZpdHktbGlzdC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYWN0aXZpdHkvaW5kZXguanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FwcC9jb25zdGFudHMuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FwcC9kaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvaW5kZXguanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FwcC9yb3V0ZXMuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3BhZ2VzL2FwcC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvcGFnZXMvaG9tZS5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvcGFnZXMvbm90LWZvdW5kLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9zaWduLXVwLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy9oYXNodGFncy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvdGFza3MvaW5kZXguanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3Rhc2tzL3N0b3JlLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy90YXNrLWZvcm0uanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3Rhc2tzL3Rhc2stbGlzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7OztBQUViLE1BQU0sQ0FBQyxLQUFLLENBQ1QsVUFBVSxDQUNULDBDQUEwQyxFQUMxQywwQ0FBMEMsQ0FDM0MsQ0FBQzs7SUFFRyxLQUFLLDJCQUFNLE9BQU87O0lBQ2xCLE1BQU0sMkJBQU0sY0FBYzs7SUFDMUIsR0FBRywyQkFBTSxPQUFPOzs7QUFHdkIsS0FBSyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVsQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxPQUFPLEVBQUU7QUFDeEMsT0FBSyxDQUFDLE1BQU0sQ0FBQyxvQkFBQyxPQUFPLE9BQUUsRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Q0FDMUQsQ0FBQyxDQUFDOzs7QUNqQkg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFFLElBQUksQ0FBQyxTQUFTLEFBQUMsR0FBRztVQUNoRDs7O1lBQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxhQUFhLENBQUM7V0FBUTtVQUN0Qzs7Y0FBSyxTQUFTLEVBQUMsWUFBWTtZQUN6QiwyQkFBRyxTQUFTLEVBQUMsWUFBWSxFQUFDLE9BQU8sRUFBRSxNQUFLLFdBQVcsQ0FBQyxJQUFJLFFBQU8sSUFBSSxDQUFDLEFBQUMsR0FBSztZQUMxRSwyQkFBRyxTQUFTLEVBQUMsYUFBYSxFQUFDLE9BQU8sRUFBRSxNQUFLLGFBQWEsQ0FBQyxJQUFJLFFBQU8sSUFBSSxDQUFDLEFBQUMsR0FBSztXQUN6RTtTQUNILENBQ0w7T0FDSCxDQUFDO0tBQ0MsQ0FDTDtHQUNIOztDQUVGLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG53aW5kb3cuUGFyc2VcbiAgLmluaXRpYWxpemUoXG4gICAgXCJEMXlVdGhIY1JOdlR5YW15ZTJ3UnpxQWJ6UzJnQjVvWE8xOWVYZThMXCIsXG4gICAgXCIwb2VhSlNnc2Nwcmg5U0hHRFpHaWZ3UXhxTnJubjRDRGd3T21Ec3NNXCJcbiAgKTtcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSb3V0ZXIgZnJvbSAncmVhY3Qtcm91dGVyJztcbmltcG9ydCBBcHAgZnJvbSAnLi9hcHAnO1xuXG4vLyBJbml0aWFsaXplIFRvdWNoRXZlbnRzXG5SZWFjdC5pbml0aWFsaXplVG91Y2hFdmVudHModHJ1ZSk7XG5cblJvdXRlci5ydW4oQXBwLnJvdXRlcywgZnVuY3Rpb24gKEhhbmRsZXIpIHtcbiAgUmVhY3QucmVuZGVyKDxIYW5kbGVyLz4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhcHAnKSk7XG59KTtcbiIsIi8vIENvcHlyaWdodCBKb3llbnQsIEluYy4gYW5kIG90aGVyIE5vZGUgY29udHJpYnV0b3JzLlxuLy9cbi8vIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhXG4vLyBjb3B5IG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlXG4vLyBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmdcbi8vIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCxcbi8vIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXRcbi8vIHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZVxuLy8gZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4vL1xuLy8gVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWRcbi8vIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuLy9cbi8vIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1Ncbi8vIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0Zcbi8vIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU5cbi8vIE5PIEVWRU5UIFNIQUxMIFRIRSBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLFxuLy8gREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SXG4vLyBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFXG4vLyBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuXG5mdW5jdGlvbiBFdmVudEVtaXR0ZXIoKSB7XG4gIHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gdGhpcy5fbWF4TGlzdGVuZXJzIHx8IHVuZGVmaW5lZDtcbn1cbm1vZHVsZS5leHBvcnRzID0gRXZlbnRFbWl0dGVyO1xuXG4vLyBCYWNrd2FyZHMtY29tcGF0IHdpdGggbm9kZSAwLjEwLnhcbkV2ZW50RW1pdHRlci5FdmVudEVtaXR0ZXIgPSBFdmVudEVtaXR0ZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX2V2ZW50cyA9IHVuZGVmaW5lZDtcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuX21heExpc3RlbmVycyA9IHVuZGVmaW5lZDtcblxuLy8gQnkgZGVmYXVsdCBFdmVudEVtaXR0ZXJzIHdpbGwgcHJpbnQgYSB3YXJuaW5nIGlmIG1vcmUgdGhhbiAxMCBsaXN0ZW5lcnMgYXJlXG4vLyBhZGRlZCB0byBpdC4gVGhpcyBpcyBhIHVzZWZ1bCBkZWZhdWx0IHdoaWNoIGhlbHBzIGZpbmRpbmcgbWVtb3J5IGxlYWtzLlxuRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnMgPSAxMDtcblxuLy8gT2J2aW91c2x5IG5vdCBhbGwgRW1pdHRlcnMgc2hvdWxkIGJlIGxpbWl0ZWQgdG8gMTAuIFRoaXMgZnVuY3Rpb24gYWxsb3dzXG4vLyB0aGF0IHRvIGJlIGluY3JlYXNlZC4gU2V0IHRvIHplcm8gZm9yIHVubGltaXRlZC5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuc2V0TWF4TGlzdGVuZXJzID0gZnVuY3Rpb24obikge1xuICBpZiAoIWlzTnVtYmVyKG4pIHx8IG4gPCAwIHx8IGlzTmFOKG4pKVxuICAgIHRocm93IFR5cGVFcnJvcignbiBtdXN0IGJlIGEgcG9zaXRpdmUgbnVtYmVyJyk7XG4gIHRoaXMuX21heExpc3RlbmVycyA9IG47XG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5lbWl0ID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgZXIsIGhhbmRsZXIsIGxlbiwgYXJncywgaSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIElmIHRoZXJlIGlzIG5vICdlcnJvcicgZXZlbnQgbGlzdGVuZXIgdGhlbiB0aHJvdy5cbiAgaWYgKHR5cGUgPT09ICdlcnJvcicpIHtcbiAgICBpZiAoIXRoaXMuX2V2ZW50cy5lcnJvciB8fFxuICAgICAgICAoaXNPYmplY3QodGhpcy5fZXZlbnRzLmVycm9yKSAmJiAhdGhpcy5fZXZlbnRzLmVycm9yLmxlbmd0aCkpIHtcbiAgICAgIGVyID0gYXJndW1lbnRzWzFdO1xuICAgICAgaWYgKGVyIGluc3RhbmNlb2YgRXJyb3IpIHtcbiAgICAgICAgdGhyb3cgZXI7IC8vIFVuaGFuZGxlZCAnZXJyb3InIGV2ZW50XG4gICAgICB9XG4gICAgICB0aHJvdyBUeXBlRXJyb3IoJ1VuY2F1Z2h0LCB1bnNwZWNpZmllZCBcImVycm9yXCIgZXZlbnQuJyk7XG4gICAgfVxuICB9XG5cbiAgaGFuZGxlciA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNVbmRlZmluZWQoaGFuZGxlcikpXG4gICAgcmV0dXJuIGZhbHNlO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGhhbmRsZXIpKSB7XG4gICAgc3dpdGNoIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAvLyBmYXN0IGNhc2VzXG4gICAgICBjYXNlIDE6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0pO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMzpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSwgYXJndW1lbnRzWzJdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICAvLyBzbG93ZXJcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgaGFuZGxlci5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNPYmplY3QoaGFuZGxlcikpIHtcbiAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGFyZ3MgPSBuZXcgQXJyYXkobGVuIC0gMSk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG5cbiAgICBsaXN0ZW5lcnMgPSBoYW5kbGVyLnNsaWNlKCk7XG4gICAgbGVuID0gbGlzdGVuZXJzLmxlbmd0aDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICBsaXN0ZW5lcnNbaV0uYXBwbHkodGhpcywgYXJncyk7XG4gIH1cblxuICByZXR1cm4gdHJ1ZTtcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gVG8gYXZvaWQgcmVjdXJzaW9uIGluIHRoZSBjYXNlIHRoYXQgdHlwZSA9PT0gXCJuZXdMaXN0ZW5lclwiISBCZWZvcmVcbiAgLy8gYWRkaW5nIGl0IHRvIHRoZSBsaXN0ZW5lcnMsIGZpcnN0IGVtaXQgXCJuZXdMaXN0ZW5lclwiLlxuICBpZiAodGhpcy5fZXZlbnRzLm5ld0xpc3RlbmVyKVxuICAgIHRoaXMuZW1pdCgnbmV3TGlzdGVuZXInLCB0eXBlLFxuICAgICAgICAgICAgICBpc0Z1bmN0aW9uKGxpc3RlbmVyLmxpc3RlbmVyKSA/XG4gICAgICAgICAgICAgIGxpc3RlbmVyLmxpc3RlbmVyIDogbGlzdGVuZXIpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIC8vIE9wdGltaXplIHRoZSBjYXNlIG9mIG9uZSBsaXN0ZW5lci4gRG9uJ3QgbmVlZCB0aGUgZXh0cmEgYXJyYXkgb2JqZWN0LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IGxpc3RlbmVyO1xuICBlbHNlIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIC8vIElmIHdlJ3ZlIGFscmVhZHkgZ290IGFuIGFycmF5LCBqdXN0IGFwcGVuZC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0ucHVzaChsaXN0ZW5lcik7XG4gIGVsc2VcbiAgICAvLyBBZGRpbmcgdGhlIHNlY29uZCBlbGVtZW50LCBuZWVkIHRvIGNoYW5nZSB0byBhcnJheS5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBbdGhpcy5fZXZlbnRzW3R5cGVdLCBsaXN0ZW5lcl07XG5cbiAgLy8gQ2hlY2sgZm9yIGxpc3RlbmVyIGxlYWtcbiAgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkgJiYgIXRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQpIHtcbiAgICB2YXIgbTtcbiAgICBpZiAoIWlzVW5kZWZpbmVkKHRoaXMuX21heExpc3RlbmVycykpIHtcbiAgICAgIG0gPSB0aGlzLl9tYXhMaXN0ZW5lcnM7XG4gICAgfSBlbHNlIHtcbiAgICAgIG0gPSBFdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycztcbiAgICB9XG5cbiAgICBpZiAobSAmJiBtID4gMCAmJiB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoID4gbSkge1xuICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCA9IHRydWU7XG4gICAgICBjb25zb2xlLmVycm9yKCcobm9kZSkgd2FybmluZzogcG9zc2libGUgRXZlbnRFbWl0dGVyIG1lbW9yeSAnICtcbiAgICAgICAgICAgICAgICAgICAgJ2xlYWsgZGV0ZWN0ZWQuICVkIGxpc3RlbmVycyBhZGRlZC4gJyArXG4gICAgICAgICAgICAgICAgICAgICdVc2UgZW1pdHRlci5zZXRNYXhMaXN0ZW5lcnMoKSB0byBpbmNyZWFzZSBsaW1pdC4nLFxuICAgICAgICAgICAgICAgICAgICB0aGlzLl9ldmVudHNbdHlwZV0ubGVuZ3RoKTtcbiAgICAgIGlmICh0eXBlb2YgY29uc29sZS50cmFjZSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAvLyBub3Qgc3VwcG9ydGVkIGluIElFIDEwXG4gICAgICAgIGNvbnNvbGUudHJhY2UoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub24gPSBFdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uY2UgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgdmFyIGZpcmVkID0gZmFsc2U7XG5cbiAgZnVuY3Rpb24gZygpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGcpO1xuXG4gICAgaWYgKCFmaXJlZCkge1xuICAgICAgZmlyZWQgPSB0cnVlO1xuICAgICAgbGlzdGVuZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG4gIH1cblxuICBnLmxpc3RlbmVyID0gbGlzdGVuZXI7XG4gIHRoaXMub24odHlwZSwgZyk7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG4vLyBlbWl0cyBhICdyZW1vdmVMaXN0ZW5lcicgZXZlbnQgaWZmIHRoZSBsaXN0ZW5lciB3YXMgcmVtb3ZlZFxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBsaXN0LCBwb3NpdGlvbiwgbGVuZ3RoLCBpO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIGxpc3QgPSB0aGlzLl9ldmVudHNbdHlwZV07XG4gIGxlbmd0aCA9IGxpc3QubGVuZ3RoO1xuICBwb3NpdGlvbiA9IC0xO1xuXG4gIGlmIChsaXN0ID09PSBsaXN0ZW5lciB8fFxuICAgICAgKGlzRnVuY3Rpb24obGlzdC5saXN0ZW5lcikgJiYgbGlzdC5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcblxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGxpc3QpKSB7XG4gICAgZm9yIChpID0gbGVuZ3RoOyBpLS0gPiAwOykge1xuICAgICAgaWYgKGxpc3RbaV0gPT09IGxpc3RlbmVyIHx8XG4gICAgICAgICAgKGxpc3RbaV0ubGlzdGVuZXIgJiYgbGlzdFtpXS5saXN0ZW5lciA9PT0gbGlzdGVuZXIpKSB7XG4gICAgICAgIHBvc2l0aW9uID0gaTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvc2l0aW9uIDwgMClcbiAgICAgIHJldHVybiB0aGlzO1xuXG4gICAgaWYgKGxpc3QubGVuZ3RoID09PSAxKSB7XG4gICAgICBsaXN0Lmxlbmd0aCA9IDA7XG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsaXN0LnNwbGljZShwb3NpdGlvbiwgMSk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlQWxsTGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIga2V5LCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgLy8gbm90IGxpc3RlbmluZyBmb3IgcmVtb3ZlTGlzdGVuZXIsIG5vIG5lZWQgdG8gZW1pdFxuICBpZiAoIXRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcikge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKVxuICAgICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgZWxzZSBpZiAodGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIC8vIGVtaXQgcmVtb3ZlTGlzdGVuZXIgZm9yIGFsbCBsaXN0ZW5lcnMgb24gYWxsIGV2ZW50c1xuICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMCkge1xuICAgIGZvciAoa2V5IGluIHRoaXMuX2V2ZW50cykge1xuICAgICAgaWYgKGtleSA9PT0gJ3JlbW92ZUxpc3RlbmVyJykgY29udGludWU7XG4gICAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycyhrZXkpO1xuICAgIH1cbiAgICB0aGlzLnJlbW92ZUFsbExpc3RlbmVycygncmVtb3ZlTGlzdGVuZXInKTtcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICByZXR1cm4gdGhpcztcbiAgfVxuXG4gIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICBpZiAoaXNGdW5jdGlvbihsaXN0ZW5lcnMpKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnMpO1xuICB9IGVsc2Uge1xuICAgIC8vIExJRk8gb3JkZXJcbiAgICB3aGlsZSAobGlzdGVuZXJzLmxlbmd0aClcbiAgICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzW2xpc3RlbmVycy5sZW5ndGggLSAxXSk7XG4gIH1cbiAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUubGlzdGVuZXJzID0gZnVuY3Rpb24odHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIXRoaXMuX2V2ZW50cyB8fCAhdGhpcy5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IFtdO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gW3RoaXMuX2V2ZW50c1t0eXBlXV07XG4gIGVsc2VcbiAgICByZXQgPSB0aGlzLl9ldmVudHNbdHlwZV0uc2xpY2UoKTtcbiAgcmV0dXJuIHJldDtcbn07XG5cbkV2ZW50RW1pdHRlci5saXN0ZW5lckNvdW50ID0gZnVuY3Rpb24oZW1pdHRlciwgdHlwZSkge1xuICB2YXIgcmV0O1xuICBpZiAoIWVtaXR0ZXIuX2V2ZW50cyB8fCAhZW1pdHRlci5fZXZlbnRzW3R5cGVdKVxuICAgIHJldCA9IDA7XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24oZW1pdHRlci5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSAxO1xuICBlbHNlXG4gICAgcmV0ID0gZW1pdHRlci5fZXZlbnRzW3R5cGVdLmxlbmd0aDtcbiAgcmV0dXJuIHJldDtcbn07XG5cbmZ1bmN0aW9uIGlzRnVuY3Rpb24oYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnZnVuY3Rpb24nO1xufVxuXG5mdW5jdGlvbiBpc051bWJlcihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdudW1iZXInO1xufVxuXG5mdW5jdGlvbiBpc09iamVjdChhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdvYmplY3QnICYmIGFyZyAhPT0gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNVbmRlZmluZWQoYXJnKSB7XG4gIHJldHVybiBhcmcgPT09IHZvaWQgMDtcbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBvblN1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uU3VibWl0fT5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImFjdGl2aXR5Lm5hbWVcIiByZWY9XCJuYW1lXCIgLz5cbiAgICAgICAgPGJ1dHRvbj4gU3RhcnQgVHJhY2tpbmcgPC9idXR0b24+XG4gICAgICA8L2Zvcm0+XG4gICAgKVxuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsPlxuICAgICAgPC91bD5cbiAgICApXG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IEFjdGl2aXR5Rm9ybSA9IHJlcXVpcmUoJy4vYWN0aXZpdHktZm9ybScpO1xuY29uc3QgQWN0aXZpdHlMaXN0ID0gcmVxdWlyZSgnLi9hY3Rpdml0eS1saXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+IEFjdGl2aXR5IDwvaDM+XG4gICAgICAgIDxBY3Rpdml0eUZvcm0gLz5cbiAgICAgICAgPEFjdGl2aXR5TGlzdCAvPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn0pO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBUQVNLUzoge1xuICAgIENPTVBMRVRFOiAndGFzazpjb21wbGV0ZScsXG4gICAgQ1JFQVRFOiAndGFzazpjcmVhdGUnLFxuICAgIERFU1RST1k6ICd0YXNrOmRlc3Ryb3knLFxuICAgIEVESVQ6ICd0YXNrOmVkaXQnLFxuICAgIFVORE9fQ09NUExFVEU6ICd0YXNrOnVuZG8tY29tcGxldGUnLFxuICAgIFVQREFURTogJ3Rhc2s6dXBkYXRlJyxcbiAgICBUT0dHTEVfQ09NUExFVEVfQUxMOiAndGFza3M6Y29tcGxldGUtYWxsJ1xuICB9LFxuXG4gIFVTRVI6IHtcbiAgICBBVVRIRU5USUNBVEVEOiAndXNlcjphdXRoZW50aWNhdGVkJyxcbiAgICBVTkFVVEhFTlRJQ0FURUQ6ICd1c2VyOnVuYXV0aGVudGljYXRlZCdcbiAgfSxcblxuICBGSVJFQkFTRToge1xuICAgIEFEREVEOiAnY2hpbGRfYWRkZWQnXG4gIH1cblxufVxuXG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IERpc3BhdGNoZXIoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi9kaXNwYXRjaGVyJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHJvdXRlcyBmcm9tICcuL3JvdXRlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBkaXNwYXRjaGVyOiBkaXNwYXRjaGVyLFxuXG4gIGNvbnN0YW50czogY29uc3RhbnRzLFxuXG4gIHJvdXRlczogcm91dGVzXG5cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBBcHAgZnJvbSAnLi4vcGFnZXMvYXBwJztcbmltcG9ydCBIb21lIGZyb20gJy4uL3BhZ2VzL2hvbWUnO1xuaW1wb3J0IE5vdEZvdW5kIGZyb20gJy4uL3BhZ2VzL25vdC1mb3VuZCc7XG5pbXBvcnQgVGFza1BhZ2UgZnJvbSAnLi4vdGFza3MnO1xuaW1wb3J0IEFjdGl2aXR5UGFnZSBmcm9tICcuLi9hY3Rpdml0eSc7XG5pbXBvcnQgU2lnblVwUGFnZSBmcm9tICcuLi9wYWdlcy9zaWduLXVwLmpzJztcblxuLy8gRGVwZW5kZW5jaWVzXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJvdXRlciBmcm9tICdyZWFjdC1yb3V0ZXInO1xuXG5sZXQgcm91dGVzO1xubGV0IFJvdXRlICA9IFJvdXRlci5Sb3V0ZTtcbmxldCBEZWZhdWx0Um91dGUgPSBSb3V0ZXIuRGVmYXVsdFJvdXRlO1xubGV0IE5vdEZvdW5kUm91dGUgPSBSb3V0ZXIuTm90Rm91bmRSb3V0ZTtcblxuaWYgKFBhcnNlLlVzZXIuY3VycmVudCgpKSB7XG4gIHJvdXRlcyA9IChcbiAgICA8Um91dGUgcGF0aD1cIi9cIiBoYW5kbGVyPXtBcHB9PlxuICAgICAgPERlZmF1bHRSb3V0ZSBoYW5kbGVyPXtIb21lfS8+XG4gICAgICA8Tm90Rm91bmRSb3V0ZSBoYW5kbGVyPXtOb3RGb3VuZH0vPlxuICAgICAgPFJvdXRlIHBhdGg9XCJ0YXNrc1wiIGhhbmRsZXI9e1Rhc2tQYWdlfS8+XG4gICAgICA8Um91dGUgcGF0aD1cImFjdGl2aXR5XCIgaGFuZGxlcj17QWN0aXZpdHlQYWdlfS8+XG4gICAgPC9Sb3V0ZT5cbiAgKTtcbn1cbmVsc2Uge1xuICByb3V0ZXMgPSAoXG4gICAgPFJvdXRlIHBhdGg9XCIvXCIgaGFuZGxlcj17QXBwfT5cbiAgICAgIDxEZWZhdWx0Um91dGUgaGFuZGxlcj17U2lnblVwUGFnZX0gLz5cbiAgICAgIDxOb3RGb3VuZFJvdXRlIGhhbmRsZXI9e05vdEZvdW5kfS8+XG4gICAgPC9Sb3V0ZT5cbiAgKTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgcm91dGVzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtSb3V0ZUhhbmRsZXJ9IGZyb20gJ3JlYWN0LXJvdXRlcic7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlcic7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIHsvKiB0aGlzIGlzIHRoZSBpbXBvcnRhbnQgcGFydCAqL31cbiAgICAgICAgPFJvdXRlSGFuZGxlci8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgU2lnblVwIGZyb20gJy4vc2lnbi11cC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGF1dGhlbnRpY2F0ZWQ6IFBhcnNlLlVzZXIuY3VycmVudCgpXG4gICAgfVxuICB9LFxuXG4gIGNvbm5lY3REcm9wYm94KCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5hdXRoZW50aWNhdGVkKSB7XG5cbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBtYXJrdXA7XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuYXV0aGVudGljYXRlZCkge1xuICAgICAgbWFya3VwID0gPFNpZ25VcC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrdXAgPSAoXG4gICAgICAgIDxidXR0b24+XG4gICAgICAgICAgPGEgaHJlZj1cIiMvdGFza3NcIj5UYXNrczwvYT5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRleHQtY2VudGVyIGhvbWVcIj5cbiAgICAgICAge21hcmt1cH1cbiAgICAgIDwvc2VjdGlvbj5cbiAgICApXG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNsYXNzIE5vdEZvdW5kIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoMT4gV2hhdCBZb3UgVGFsa2luZyBBYm91dCwgV2lsbGlzPzwvaDE+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBOb3RGb3VuZDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY29uc3QgU2lnblVwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgdXNlcjogbmV3IFBhcnNlLlVzZXIoKVxuICAgIH1cbiAgfSxcblxuICBvblN1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgbGV0IGVtYWlsID0gdGhpcy5yZWZzLmVtYWlsLmdldERPTU5vZGUoKS52YWx1ZTtcbiAgICBsZXQgcGFzc3dvcmQgPSB0aGlzLnJlZnMucGFzc3dvcmQuZ2V0RE9NTm9kZSgpLnZhbHVlO1xuICAgIGxldCBwYXNzd29yZENvbmZpcm1hdGlvbiA9IHRoaXMucmVmcy5wYXNzd29yZENvbmZpcm1hdGlvbi5nZXRET01Ob2RlKCkudmFsdWU7XG4gICAgbGV0IGFsbFZhbHVlcyA9IGVtYWlsICYmIHBhc3N3b3JkICYmIHBhc3N3b3JkQ29uZmlybWF0aW9uO1xuICAgIGxldCBtYXRjaGluZ1Bhc3N3b3JkcyA9IHBhc3N3b3JkID09PSBwYXNzd29yZENvbmZpcm1hdGlvbjtcblxuICAgIGlmIChhbGxWYWx1ZXMgJiYgbWF0Y2hpbmdQYXNzd29yZHMpIHtcbiAgICAgIHRoaXMuc3RhdGUudXNlci5zZXQoJ3VzZXJuYW1lJywgZW1haWwpO1xuICAgICAgdGhpcy5zdGF0ZS51c2VyLnNldCgncGFzc3dvcmQnLCBwYXNzd29yZCk7XG5cbiAgICAgIHRoaXMuc3RhdGUudXNlci5zaWduVXAobnVsbCwge1xuICAgICAgICBzdWNjZXNzOiBmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgY29uc29sZS5sb2codXNlcik7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbih1c2VyLCBlcnJvcikge1xuICAgICAgICAgIC8vIFNob3cgdGhlIGVycm9yIG1lc3NhZ2Ugc29tZXdoZXJlIGFuZCBsZXQgdGhlIHVzZXIgdHJ5IGFnYWluLlxuICAgICAgICAgIGFsZXJ0KFwiRXJyb3I6IFwiICsgZXJyb3IuY29kZSArIFwiIFwiICsgZXJyb3IubWVzc2FnZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uU3VibWl0fT5cbiAgICAgICAgPGlucHV0IHJlZj1cImVtYWlsXCIgdHlwZT1cImVtYWlsXCIgcGxhY2Vob2xkZXI9XCIgRW1haWwgQWRkcmVzc1wiIC8+XG4gICAgICAgIDxici8+XG4gICAgICAgIDxpbnB1dCByZWY9XCJwYXNzd29yZFwiIHR5cGU9XCJwYXNzd29yZFwiIHBsYWNlaG9sZGVyPVwiIFBhc3N3b3JkXCIgLz5cbiAgICAgICAgPGJyLz5cbiAgICAgICAgPGlucHV0IHJlZj1cInBhc3N3b3JkQ29uZmlybWF0aW9uXCIgdHlwZT1cInBhc3N3b3JkXCIgcGxhY2Vob2xkZXI9XCIgUGFzc3dvcmQgQ29uZmlybWF0aW9uXCIgLz5cbiAgICAgICAgPGJyLz5cbiAgICAgICAgPGJ1dHRvbj4gU2lnbiBVcCA8L2J1dHRvbj5cbiAgICAgIDwvZm9ybT5cbiAgICApO1xuICB9XG5cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBTaWduVXA7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlcic7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuXG4gIF9vbkNsaWNrKGhhc2h0YWcpIHtcbiAgICAvLyBDaGVjayBpZiBoYXNodGFnIGlzIHNhbWUgYXMgY3VycmVudGx5IHNlbGVjdGVkXG4gICAgbGV0IGlzU2VsZWN0ZWQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkID09PSBoYXNodGFnO1xuXG4gICAgLy8gU2V0IHNlbGVjdGVkIGhhc2h0YWcgdG8gc3RhdGVcbiAgICB0aGlzLnNldFN0YXRlKHsgc2VsZWN0ZWQ6IGhhc2h0YWcgfSk7XG5cbiAgICAvLyBEaXNwYXRjaCBzZWFyY2ggYnkgaGFzaHRhZ1xuICAgIGRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogJ3NlYXJjaDpoYXNodGFnJyxcbiAgICAgIGRhdGE6IGlzU2VsZWN0ZWQgPyB1bmRlZmluZWQgOiBoYXNodGFnXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwidGFzay1oYXNodGFncy1saXN0XCI+XG4gICAgICAgIHt0aGlzLnByb3BzLmhhc2h0YWdzLm1hcCgoaGFzaFRhZykgPT4ge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8bGkga2V5PXtoYXNoVGFnfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17e3NlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkID09PSBoYXNoVGFnIH19PlxuICAgICAgICAgICAgICA8YSBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrLmJpbmQodGhpcywgaGFzaFRhZyl9PlxuICAgICAgICAgICAgICAgIHt7aGFzaFRhZ319XG4gICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH1cblxufSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBUYXNrTGlzdCBmcm9tICcuL3Rhc2stbGlzdCc7XG5pbXBvcnQgVGFza3MgZnJvbSAnLi9zdG9yZSc7XG5pbXBvcnQgVGFza0Zvcm0gZnJvbSAnLi90YXNrLWZvcm0nO1xuaW1wb3J0IEhhc2h0YWdzIGZyb20gJy4vaGFzaHRhZ3MnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuXG5jbGFzcyBUYXNrUGFnZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbG9hZGVkOiBUYXNrcy5faXNMb2FkZWQsXG4gICAgICB0YXNrczogIFRhc2tzLl9pc0xvYWRlZCA/IFRhc2tzLmNvbGxlY3Rpb24ubW9kZWxzIDogW11cbiAgICB9XG4gIH1cblxuICBfb25DaGFuZ2UoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHRhc2tzOiBUYXNrcy5jb2xsZWN0aW9uLm1vZGVscyB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICBUYXNrcy5jb2xsZWN0aW9uLmxvYWQoKVxuICAgICAgLnRoZW4oKHRhc2tzKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBsb2FkZWQ6IHRydWUsXG4gICAgICAgICAgdGFza3M6IHRhc2tzXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAvLyBSZWdpc3RlciB3aXRoIGFwcCBkaXNwYXRjaGVyXG4gICAgdGhpcy50b2tlbiA9IGRpc3BhdGNoZXIucmVnaXN0ZXIoKHBheWxvYWQpID0+IHtcbiAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb25UeXBlKSB7XG4gICAgICAgIGNhc2UgJ3NlYXJjaDpoYXNodGFnJzpcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRhc2tzOiBUYXNrcy5nZXRCeUhhc2h0YWcocGF5bG9hZC5kYXRhKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0YXNrczpsb2FkJzpcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxvYWRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHRhc2tzOiBUYXNrcy50YWJsZS5xdWVyeSgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBXYXRjaCBmb3IgY2hhbmdlcyB0byBUYXNrc1xuICAgIFRhc2tzLmNvbGxlY3Rpb24ub24oJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgLy8gVW5yZWdpc3RlciBmcm9tIGFwcCBkaXNwYXRjaGVyXG4gICAgZGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMudG9rZW4pO1xuICAgIC8vIFVud2F0Y2ggZm9yIGNoYW5nZXMgdG8gVGFza3NcbiAgICBUYXNrcy5jb2xsZWN0aW9uLm9uKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgdGFza3MgPSB0aGlzLnN0YXRlLnRhc2tzO1xuXG4gICAgbGV0IGhhc2h0YWdzID0gdGhpcy5zdGF0ZS5sb2FkZWQgPyBUYXNrcy5jb2xsZWN0aW9uLmdldEhhc2h0YWdzKCkgOiBbXTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZ2VcIj5cbiAgICAgICAgPGg0IGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+IFRhc2tzIDwvaDQ+XG4gICAgICAgIDxIYXNodGFncyBoYXNodGFncz17aGFzaHRhZ3N9Lz5cbiAgICAgICAgPFRhc2tGb3JtIC8+XG4gICAgICAgIHt0aGlzLnN0YXRlLmxvYWRlZCA/IDxUYXNrTGlzdCB0YXNrcz17dGFza3N9Lz4gOiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtc3Bpbm5lciBmYS1zcGluIGZhLTJ4XCI+PC9pPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGFza1BhZ2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXIuanMnO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi9hcHAvY29uc3RhbnRzLmpzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbi8qKlxuICogUmVmZXJlbmNlIHRvIHRoaXMgZmlsZSdzIG1vZHVsZVxuICogQHR5cGUge3t9fVxuICovXG5sZXQgVGFza3MgPSB7fTtcblxuLyoqXG4gKiBXaGV0aGVyIHN0b3JlIGhhcyBiZWVuIGxvYWRlZFxuICogQHR5cGUge2Jvb2xlYW59XG4gKiBAcHJpdmF0ZVxuICovXG5UYXNrcy5pc0xvYWRlZCA9IGZhbHNlO1xuXG4vKipcbiAqIEN1cnJlbnRseSBsb2dnZWQgaW4gdXNlciBpZiBjdXJyZW50IHVzZXJcbiAqIEB0eXBlIHtvYmplY3R9XG4gKi9cblRhc2tzLmN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbmNvbnN0IFRhc2tDb25zdGFudHMgPSBjb25zdGFudHMuVEFTS1M7XG5jb25zdCBDSEFOR0VfRVZFTlQgPSAnY2hhbmdlJztcblxuLyoqXG4gKiBNb2RlbCBmb3IgdGFza3NcbiAqL1xuY29uc3QgVGFzayA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ1Rhc2tPYmplY3QnLCB7XG5cbiAgZ2V0SGFzaHRhZ3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdoYXNodGFncycpIHx8IFtdO1xuICB9XG5cbn0pO1xuXG4vKipcbiAqIENvbGxlY3Rpb24gZm9yIHRhc2tzc1xuICogQHR5cGUge1NlbGVjdGlvbi5leHRlbmR9XG4gKi9cbmxldCBUYXNrQ29sbGVjdGlvbiA9IFBhcnNlLkNvbGxlY3Rpb24uZXh0ZW5kKF8ubWVyZ2Uoe1xuXG4gIC8vIFNldCBtb2RlbCBvZiBjb2xsZWN0aW9uXG4gIG1vZGVsOiBUYXNrLFxuXG4gIC8qKlxuICAgKiBUcnVlIGlmIHN0b3JlIGhhcyBiZWVuIGxvYWRlZCwgZmFsc2UgaWYgaXQgaGFzIG5vdFxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICovXG4gIGlzTG9hZGVkOiBmYWxzZSxcblxuICBsb2FkKCkge1xuICAgIGxldCBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeSh0aGlzLm1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKFwidXNlclwiLCBQYXJzZS5Vc2VyLmN1cnJlbnQoKS5pZCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHJldHVybiBxdWVyeS5maW5kKHtcbiAgICAgICAgc3VjY2VzczogKHRhc2tzKSA9PiB7XG4gICAgICAgICAgVGFza3MuY29sbGVjdGlvbi5hZGQodGFza3MpO1xuICAgICAgICAgIFRhc2tzLmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0YXNrcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIHJldHVybiByZWplY3QoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgdGFza1xuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHRhc2tcbiAgICovXG4gIGFkZFRhc2sodGFzaykge1xuICAgIHRhc2suY29tcGxldGUgPSBmYWxzZTtcblxuICAgIC8vIEdldCBoYXNodGFncyBmcm9tIGRlc2NyaXB0aW9uXG4gICAgdGFzay5oYXNodGFncyA9IFRhc2tzLmNvbGxlY3Rpb24ucGFyc2VIYXNodGFncyh0YXNrLmRlc2NyaXB0aW9uKTtcblxuICAgIC8vIFNldCBjdXJyZW50IHVzZXIncyBpZCB0byB0YXNrXG4gICAgdGFzay51c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCkuaWQ7XG5cbiAgICAvLyBQT1NUIHRhc2sgdG8gUGFyc2UgQVBJXG4gICAgdGhpcy5jcmVhdGUodGFzaywge1xuICAgICAgc3VjY2VzcyhyZXNwb25zZSkge1xuICAgICAgICByZXNwb25zZS5jb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcigpIHtcbiAgICAgICAgZGVidWdnZXI7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBhIFRPRE8gaXRlbS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBpZFxuICAgKiBAcGFyYW0ge29iamVjdH0gdXBkYXRlcyBBbiBvYmplY3QgbGl0ZXJhbCBjb250YWluaW5nIG9ubHkgdGhlIGRhdGEgdG8gYmVcbiAgICogICAgIHVwZGF0ZWQuXG4gICAqL1xuICB1cGRhdGUoaWQsIHVwZGF0ZXMpIHtcbiAgICB2YXIgdGFzayA9IHRoaXMudGFibGUucXVlcnkoeyBpZDogaWQgfSlbMF07XG4gICAgaWYgKHRhc2spIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyh1cGRhdGVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgcmV0dXJuIHRhc2suc2V0KGtleSwgdXBkYXRlc1trZXldKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uc29sZS53YXJuKGBUYXNrICR7aWR9IGNvdWxkIG5vdCBiZSBmb3VuZGApO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVXBkYXRlIGFsbCBvZiB0aGUgVE9ETyBpdGVtcyB3aXRoIHRoZSBzYW1lIG9iamVjdC5cbiAgICogICAgIHRoZSBkYXRhIHRvIGJlIHVwZGF0ZWQuICBVc2VkIHRvIG1hcmsgYWxsIFRPRE9zIGFzIGNvbXBsZXRlZC5cbiAgICogQHBhcmFtICB7b2JqZWN0fSB1cGRhdGVzIEFuIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5pbmcgb25seSB0aGUgZGF0YSB0byBiZVxuICAgKiAgICAgdXBkYXRlZC5cbiAgICovXG4gIHVwZGF0ZUFsbCh1cGRhdGVzKSB7XG4gICAgbGV0IHRhc2tzID0gdGhpcy50YWJsZS5xdWVyeSgpO1xuICAgIHJldHVybiB0YXNrcy5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgIFRhc2tDb2xsZWN0aW9uLnVwZGF0ZSh0YXNrLmdldCgnaWQnKSwgdXBkYXRlcyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhIFRPRE8gaXRlbS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBpZFxuICAgKi9cbiAgZGVzdHJveShpZCkge1xuICAgIGRlbGV0ZSBfdGFza3NbaWRdO1xuICB9LFxuXG4gIC8qKlxuICAgKiBEZWxldGUgYWxsIHRoZSBjb21wbGV0ZWQgVE9ETyBpdGVtcy5cbiAgICovXG4gIGRlc3Ryb3lDb21wbGV0ZWQoKSB7XG4gICAgZm9yICh2YXIgaWQgaW4gX3Rhc2tzKSB7XG4gICAgICBpZiAoX3Rhc2tzW2lkXS5jb21wbGV0ZSkge1xuICAgICAgICBkZXN0cm95KGlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRlc3RzIHdoZXRoZXIgYWxsIHRoZSByZW1haW5pbmcgVE9ETyBpdGVtcyBhcmUgbWFya2VkIGFzIGNvbXBsZXRlZC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGFyZUFsbENvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpZCBpbiBfdGFza3MpIHtcbiAgICAgIGlmICghX3Rhc2tzW2lkXS5jb21wbGV0ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGVudGlyZSBjb2xsZWN0aW9uIG9mIFRPRE9zLlxuICAgKiBAcmV0dXJuIHtvYmplY3R9XG4gICAqL1xuICBnZXRBbGw6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRhYmxlLnF1ZXJ5KCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHZXQgc3RvcmUncyByZWNvcmRzIGZpbHRlcmVkIG9uIHByb3BlcnR5IGJ5IHZhbHVlXG4gICAqIEBwYXJhbSAgeyp9IHByb3BlcnR5IFByb3BlcnR5IHRvIGZpbHRlciByZWNvcmRzIG9uXG4gICAqIEBwYXJhbSAgeyp9IHZhbHVlICAgIFZhbHVlIHRvIGZpbHRlciBmb3JcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBnZXRCeShwcm9wZXJ0eSwgdmFsdWUsIG5vdCkge1xuICAgIGxldCB0YXNrcyA9IHRoaXMudGFibGUucXVlcnkoKTtcbiAgICBpZiAobm90KVxuICAgICAgcmV0dXJuIHRhc2tzLmZpbHRlcihyZWNvcmQgPT4gcmVjb3JkW3Byb3BlcnR5XSAhPT0gdmFsdWUpO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiB0YXNrcy5maWx0ZXIocmVjb3JkID0+IHJlY29yZFtwcm9wZXJ0eV0gPT09IHZhbHVlKTtcbiAgfSxcblxuICBnZXRCeUhhc2h0YWcoaGFzaHRhZykge1xuICAgIHJldHVybiBUYXNrcy5jb2xsZWN0aW9uLm1vZGVscy5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xuICAgICAgbGV0IHRhZ3MgPSB0YXNrLmdldCgnaGFzaHRhZ3MnKTtcbiAgICAgIHJldHVybiB0YWdzLmxlbmd0aCgpICYmIH50YWdzLnRvQXJyYXkoKS5pbmRleE9mKGhhc2h0YWcpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2V0IGhhc2h0YWdzIGZyb20gc3RvcmUncyByZWNvcmRzXG4gICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICovXG4gIGdldEhhc2h0YWdzKCkge1xuICAgIHJldHVybiBUYXNrcy5jb2xsZWN0aW9uLm1vZGVsc1xuICAgICAgLmZpbHRlcigodGFzayk9PiB7XG4gICAgICAgIHJldHVybiB0YXNrLmdldEhhc2h0YWdzKCkubGVuZ3RoO1xuICAgICAgfSlcbiAgICAgIC5tYXAoKHRhc2spID0+IHRhc2suZ2V0KCdoYXNodGFncycpKTtcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdldCBhcnJheSBvZiBoYXNodGFncyBmcm9tIHRleHRcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0ZXh0IFRleHQgdG8gc2VhcmNoIGZvciBoYXNodGFnc1xuICAgKiBAcmV0dXJuIHtBcnJheX0gICAgICBMaXN0IG9mIGhhc2h0YWdzXG4gICAqL1xuICBwYXJzZUhhc2h0YWdzKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC5tYXRjaCgvKCNbYS16XFxkXVtcXHctXSopL2lnKSB8fCBbXTtcbiAgfSxcblxuICBlbWl0Q2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRyaWdnZXIoQ0hBTkdFX0VWRU5UKTtcbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICovXG4gIGFkZENoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHRoaXMub24oQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqL1xuICByZW1vdmVDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbn0pKTtcblxuLy8gUmVnaXN0ZXIgY2FsbGJhY2sgdG8gaGFuZGxlIGFsbCB1cGRhdGVzXG5kaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKGFjdGlvbikge1xuICBsZXQgdGV4dDtcbiAgbGV0IGNvbGxlY3Rpb24gPSBUYXNrcy5jb2xsZWN0aW9uO1xuXG4gIHN3aXRjaChhY3Rpb24uYWN0aW9uVHlwZSkge1xuICAgIGNhc2UgVGFza0NvbnN0YW50cy5DUkVBVEU6XG4gICAgICBpZiAoYWN0aW9uLmRhdGEuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgIGNvbGxlY3Rpb24uYWRkVGFzayhhY3Rpb24uZGF0YSk7XG4gICAgICAgIGNvbGxlY3Rpb24uZW1pdENoYW5nZSgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuVE9HR0xFX0NPTVBMRVRFX0FMTDpcbiAgICAgIGlmIChUYXNrcy5hcmVBbGxDb21wbGV0ZSgpKSB7XG4gICAgICAgIGNvbGxlY3Rpb24udXBkYXRlQWxsKHtjb21wbGV0ZTogZmFsc2V9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbGxlY3Rpb24udXBkYXRlQWxsKHtjb21wbGV0ZTogdHJ1ZX0pO1xuICAgICAgfVxuICAgICAgY29sbGVjdGlvbi5lbWl0Q2hhbmdlKCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgVGFza0NvbnN0YW50cy5VTkRPX0NPTVBMRVRFOlxuICAgICAgY29sbGVjdGlvbi51cGRhdGUoYWN0aW9uLmlkLCB7Y29tcGxldGU6IGZhbHNlfSk7XG4gICAgICBjb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLkNPTVBMRVRFOlxuICAgICAgY29sbGVjdGlvbi51cGRhdGUoYWN0aW9uLmlkLCB7Y29tcGxldGU6IHRydWV9KTtcbiAgICAgIGNvbGxlY3Rpb24uZW1pdENoYW5nZSgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuVVBEQVRFOlxuICAgICAgdGV4dCA9IGFjdGlvbi50ZXh0LnRyaW0oKTtcbiAgICAgIGlmICh0ZXh0ICE9PSAnJykge1xuICAgICAgICBjb2xsZWN0aW9uLnVwZGF0ZShhY3Rpb24uaWQsIHt0ZXh0OiB0ZXh0fSk7XG4gICAgICAgIGNvbGxlY3Rpb24uZW1pdENoYW5nZSgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuREVTVFJPWTpcbiAgICAgIGFjdGlvbi5kYXRhLmRlc3Ryb3koe1xuICAgICAgICBzdWNjZXNzKG9iamVjdCkge1xuICAgICAgICAgIGNvbGxlY3Rpb24uZW1pdENoYW5nZSgpO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcihvYmplY3QsIGVycikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAvLyBubyBvcFxuICB9XG5cbn0pO1xuXG5UYXNrcy5tb2RlbCA9IFRhc2s7XG5cblRhc2tzLmNvbGxlY3Rpb24gPSBuZXcgVGFza0NvbGxlY3Rpb24oKTtcblxuZXhwb3J0IGRlZmF1bHQgVGFza3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlcic7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uL2FwcC9jb25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdGhpcy5kaXNwYXRjaFRva2VuID0gZGlzcGF0Y2hlci5yZWdpc3RlcigocGF5bG9hZCkgPT4ge1xuICAgICAgc3dpdGNoKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICAgICAgICBjYXNlIGNvbnN0YW50cy5UQVNLUy5FRElUOlxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmFsdWU6IHBheWxvYWQuZGF0YS5nZXQoJ2Rlc2NyaXB0aW9uJylcbiAgICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgLy8gVW5yZWdpc3RlciBmcm9tIGFwcCBkaXNwYXRjaGVyXG4gICAgZGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hUb2tlbik7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhhbmRsZSBmb3JtIHN1Ym1pc3Npb25cbiAgICogQHBhcmFtIHtTeW50aGV0aWNFdmVudH0gZXZlbnRcbiAgICovXG4gIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIEVtcHR5IGlucHV0IHZhbHVlXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiAnJyB9KTtcblxuICAgIC8vIERpc3BhdGNoIHRhc2sgY3JlYXRpb24gZXZlbnRcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IGNvbnN0YW50cy5UQVNLUy5DUkVBVEUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnJlZnMubmFtZS5nZXRET01Ob2RlKCkudmFsdWVcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBTZXQgdmFsdWUgb2YgaW5wdXQgZmllbGQgdG8gc3RhdGUudmFsdWUgb24gY2hhbmdlXG4gICAqL1xuICBvbkNoYW5nZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IHRoaXMucmVmcy5uYW1lLmdldERPTU5vZGUoKS52YWx1ZSB9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImNhcmRcIj5cbiAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwidGFzay1mb3JtXCIgb25TdWJtaXQ9e3RoaXMub25TdWJtaXR9PlxuICAgICAgICAgIDxpbnB1dCBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggdGFza3Mgb3IgY3JlYXRlIG5ldyB0YXNrXCJcbiAgICAgICAgICAgICAgICAgcmVmPVwibmFtZVwiXG4gICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9Lz5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgPC9zZWN0aW9uPlxuICAgICk7XG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uL2FwcC9jb25zdGFudHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgb25FZGl0Q2xpY2sodGFzaykge1xuICAgIGRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogY29uc3RhbnRzLlRBU0tTLkVESVQsXG4gICAgICBkYXRhOiB0YXNrXG4gICAgfSlcbiAgfSxcblxuICAvKipcbiAgICogRGVsZXRlIHRhc2tcbiAgICogQHBhcmFtIHtjaGlsZH0gdGFza1xuICAgKi9cbiAgb25EZWxldGVDbGljayh0YXNrKSB7XG4gICAgZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBjb25zdGFudHMuVEFTS1MuREVTVFJPWSxcbiAgICAgIGRhdGE6IHRhc2tcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgbGV0IHRhc2tzID0gdGhpcy5wcm9wcy50YXNrcyB8fCBbXTtcblxuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwidGFzay1saXN0XCI+XG4gICAgICAgIHt0YXNrcy5tYXAoKHRhc2spID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpIGtleT17dGFzay5nZXQoXCJvYmplY3RJZFwiKX0gY2xhc3NOYW1lPVwidGFzay1saXN0LWl0ZW0gY2FyZFwiPlxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9e3Rhc2suY29tcGxldGVkfSAvPlxuICAgICAgICAgICAgICA8c3Bhbj57dGFzay5nZXQoJ2Rlc2NyaXB0aW9uJyl9PC9zcGFuPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB1bGwtcmlnaHRcIj5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1lZGl0XCIgb25DbGljaz17dGhpcy5vbkVkaXRDbGljay5iaW5kKHRoaXMsIHRhc2spfT48L2k+XG4gICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtY2xvc2VcIiBvbkNsaWNrPXt0aGlzLm9uRGVsZXRlQ2xpY2suYmluZCh0aGlzLCB0YXNrKX0+PC9pPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH1cblxufSk7XG4iXX0=
