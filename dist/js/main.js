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

        Tasks.collection.load().then(function (collection) {
          return _this.setState({
            loaded: true,
            tasks: collection.models
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

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

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
var TaskCollection = Parse.Collection.extend(_.merge(EventEmitter.prototype, {

  // Set model of collection
  model: Task,

  /**
   * True if store has been loaded, false if it has not
   * @type {boolean}
   */
  isLoaded: false,

  load: function load() {
    return new Promise(function (resolve, reject) {
      return Tasks.collection.fetch({
        success: function () {
          for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
            args[_key] = arguments[_key];
          }

          Tasks.isLoaded = true;
          return resolve.apply(undefined, args);
        },
        error: function () {
          return reject.apply(undefined, _toConsumableArray(args));
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
    task.hashtags = Tasks.collection.parseHashtags(task.description);
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

  onEditClick: function onEditClick() {},

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

    return React.createElement(
      "ul",
      { className: "task-list" },
      this.props.tasks.map(function (task) {
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
            React.createElement("i", { className: "fa fa-edit", onClick: _this.onEditClick }),
            React.createElement("i", { className: "fa fa-close", onClick: _this.onDeleteClick.bind(_this, task) })
          )
        );
      })
    );
  }

});

},{"../app/constants.js":6,"../app/dispatcher.js":7,"react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLXRhc2tzL3NyYy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2V2ZW50cy9ldmVudHMuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLXRhc2tzL3NyYy9hY3Rpdml0eS9hY3Rpdml0eS1mb3JtLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy10YXNrcy9zcmMvYWN0aXZpdHkvYWN0aXZpdHktbGlzdC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtdGFza3Mvc3JjL2FjdGl2aXR5L2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy10YXNrcy9zcmMvYXBwL2NvbnN0YW50cy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtdGFza3Mvc3JjL2FwcC9kaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy10YXNrcy9zcmMvYXBwL2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy10YXNrcy9zcmMvYXBwL3JvdXRlcy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtdGFza3Mvc3JjL3BhZ2VzL2FwcC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtdGFza3Mvc3JjL3BhZ2VzL2hvbWUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLXRhc2tzL3NyYy9wYWdlcy9ub3QtZm91bmQuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLXRhc2tzL3NyYy9wYWdlcy9zaWduLXVwLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy10YXNrcy9zcmMvdGFza3MvaGFzaHRhZ3MuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLXRhc2tzL3NyYy90YXNrcy9pbmRleC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtdGFza3Mvc3JjL3Rhc2tzL3N0b3JlLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy10YXNrcy9zcmMvdGFza3MvdGFzay1mb3JtLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy10YXNrcy9zcmMvdGFza3MvdGFzay1saXN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsWUFBWSxDQUFDOzs7O0FBRWIsTUFBTSxDQUFDLEtBQUssQ0FDVCxVQUFVLENBQ1QsMENBQTBDLEVBQzFDLDBDQUEwQyxDQUMzQyxDQUFDOztJQUVHLEtBQUssMkJBQU0sT0FBTzs7SUFDbEIsTUFBTSwyQkFBTSxjQUFjOztJQUMxQixHQUFHLDJCQUFNLE9BQU87OztBQUd2QixLQUFLLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRWxDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxVQUFVLE9BQU8sRUFBRTtBQUN4QyxPQUFLLENBQUMsTUFBTSxDQUFDLG9CQUFDLE9BQU8sT0FBRSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQztDQUMxRCxDQUFDLENBQUM7OztBQ2pCSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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QyxJQUFJLEVBQUs7QUFDOUIsZUFDRTs7WUFBSSxHQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsQUFBQyxFQUFDLFNBQVMsRUFBQyxxQkFBcUI7VUFDNUQsK0JBQU8sSUFBSSxFQUFDLFVBQVUsRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLFNBQVMsQUFBQyxHQUFHO1VBQ2hEOzs7WUFBTyxJQUFJLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQztXQUFRO1VBQ3RDOztjQUFLLFNBQVMsRUFBQyxZQUFZO1lBQ3pCLDJCQUFHLFNBQVMsRUFBQyxZQUFZLEVBQUMsT0FBTyxFQUFFLE1BQUssV0FBVyxBQUFDLEdBQUs7WUFDekQsMkJBQUcsU0FBUyxFQUFDLGFBQWEsRUFBQyxPQUFPLEVBQUUsTUFBSyxhQUFhLENBQUMsSUFBSSxRQUFPLElBQUksQ0FBQyxBQUFDLEdBQUs7V0FDekU7U0FDSCxDQUNMO09BQ0gsQ0FBQztLQUNDLENBQ0w7R0FDSDs7Q0FFRixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcblxud2luZG93LlBhcnNlXG4gIC5pbml0aWFsaXplKFxuICAgIFwiRDF5VXRoSGNSTnZUeWFteWUyd1J6cUFielMyZ0I1b1hPMTllWGU4TFwiLFxuICAgIFwiMG9lYUpTZ3NjcHJoOVNIR0RaR2lmd1F4cU5ybm40Q0Rnd09tRHNzTVwiXG4gICk7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUm91dGVyIGZyb20gJ3JlYWN0LXJvdXRlcic7XG5pbXBvcnQgQXBwIGZyb20gJy4vYXBwJztcblxuLy8gSW5pdGlhbGl6ZSBUb3VjaEV2ZW50c1xuUmVhY3QuaW5pdGlhbGl6ZVRvdWNoRXZlbnRzKHRydWUpO1xuXG5Sb3V0ZXIucnVuKEFwcC5yb3V0ZXMsIGZ1bmN0aW9uIChIYW5kbGVyKSB7XG4gIFJlYWN0LnJlbmRlcig8SGFuZGxlci8+LCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYXBwJykpO1xufSk7XG4iLCIvLyBDb3B5cmlnaHQgSm95ZW50LCBJbmMuIGFuZCBvdGhlciBOb2RlIGNvbnRyaWJ1dG9ycy5cbi8vXG4vLyBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYVxuLy8gY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZVxuLy8gXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nXG4vLyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsXG4vLyBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0XG4vLyBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGVcbi8vIGZvbGxvd2luZyBjb25kaXRpb25zOlxuLy9cbi8vIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkXG4vLyBpbiBhbGwgY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbi8vXG4vLyBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTXG4vLyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GXG4vLyBNRVJDSEFOVEFCSUxJVFksIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOXG4vLyBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSxcbi8vIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUlxuLy8gT1RIRVJXSVNFLCBBUklTSU5HIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRVxuLy8gVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cblxuZnVuY3Rpb24gRXZlbnRFbWl0dGVyKCkge1xuICB0aGlzLl9ldmVudHMgPSB0aGlzLl9ldmVudHMgfHwge307XG4gIHRoaXMuX21heExpc3RlbmVycyA9IHRoaXMuX21heExpc3RlbmVycyB8fCB1bmRlZmluZWQ7XG59XG5tb2R1bGUuZXhwb3J0cyA9IEV2ZW50RW1pdHRlcjtcblxuLy8gQmFja3dhcmRzLWNvbXBhdCB3aXRoIG5vZGUgMC4xMC54XG5FdmVudEVtaXR0ZXIuRXZlbnRFbWl0dGVyID0gRXZlbnRFbWl0dGVyO1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9ldmVudHMgPSB1bmRlZmluZWQ7XG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLl9tYXhMaXN0ZW5lcnMgPSB1bmRlZmluZWQ7XG5cbi8vIEJ5IGRlZmF1bHQgRXZlbnRFbWl0dGVycyB3aWxsIHByaW50IGEgd2FybmluZyBpZiBtb3JlIHRoYW4gMTAgbGlzdGVuZXJzIGFyZVxuLy8gYWRkZWQgdG8gaXQuIFRoaXMgaXMgYSB1c2VmdWwgZGVmYXVsdCB3aGljaCBoZWxwcyBmaW5kaW5nIG1lbW9yeSBsZWFrcy5cbkV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzID0gMTA7XG5cbi8vIE9idmlvdXNseSBub3QgYWxsIEVtaXR0ZXJzIHNob3VsZCBiZSBsaW1pdGVkIHRvIDEwLiBUaGlzIGZ1bmN0aW9uIGFsbG93c1xuLy8gdGhhdCB0byBiZSBpbmNyZWFzZWQuIFNldCB0byB6ZXJvIGZvciB1bmxpbWl0ZWQuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnNldE1heExpc3RlbmVycyA9IGZ1bmN0aW9uKG4pIHtcbiAgaWYgKCFpc051bWJlcihuKSB8fCBuIDwgMCB8fCBpc05hTihuKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ24gbXVzdCBiZSBhIHBvc2l0aXZlIG51bWJlcicpO1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSBuO1xuICByZXR1cm4gdGhpcztcbn07XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUuZW1pdCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGVyLCBoYW5kbGVyLCBsZW4sIGFyZ3MsIGksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBJZiB0aGVyZSBpcyBubyAnZXJyb3InIGV2ZW50IGxpc3RlbmVyIHRoZW4gdGhyb3cuXG4gIGlmICh0eXBlID09PSAnZXJyb3InKSB7XG4gICAgaWYgKCF0aGlzLl9ldmVudHMuZXJyb3IgfHxcbiAgICAgICAgKGlzT2JqZWN0KHRoaXMuX2V2ZW50cy5lcnJvcikgJiYgIXRoaXMuX2V2ZW50cy5lcnJvci5sZW5ndGgpKSB7XG4gICAgICBlciA9IGFyZ3VtZW50c1sxXTtcbiAgICAgIGlmIChlciBpbnN0YW5jZW9mIEVycm9yKSB7XG4gICAgICAgIHRocm93IGVyOyAvLyBVbmhhbmRsZWQgJ2Vycm9yJyBldmVudFxuICAgICAgfVxuICAgICAgdGhyb3cgVHlwZUVycm9yKCdVbmNhdWdodCwgdW5zcGVjaWZpZWQgXCJlcnJvclwiIGV2ZW50LicpO1xuICAgIH1cbiAgfVxuXG4gIGhhbmRsZXIgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzVW5kZWZpbmVkKGhhbmRsZXIpKVxuICAgIHJldHVybiBmYWxzZTtcblxuICBpZiAoaXNGdW5jdGlvbihoYW5kbGVyKSkge1xuICAgIHN3aXRjaCAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgLy8gZmFzdCBjYXNlc1xuICAgICAgY2FzZSAxOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcyk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAyOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdKTtcbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlIDM6XG4gICAgICAgIGhhbmRsZXIuY2FsbCh0aGlzLCBhcmd1bWVudHNbMV0sIGFyZ3VtZW50c1syXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgLy8gc2xvd2VyXG4gICAgICBkZWZhdWx0OlxuICAgICAgICBsZW4gPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgICAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGhhbmRsZXIuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzT2JqZWN0KGhhbmRsZXIpKSB7XG4gICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBhcmdzID0gbmV3IEFycmF5KGxlbiAtIDEpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW47IGkrKylcbiAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuXG4gICAgbGlzdGVuZXJzID0gaGFuZGxlci5zbGljZSgpO1xuICAgIGxlbiA9IGxpc3RlbmVycy5sZW5ndGg7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbjsgaSsrKVxuICAgICAgbGlzdGVuZXJzW2ldLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmFkZExpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIG07XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuXG4gIC8vIFRvIGF2b2lkIHJlY3Vyc2lvbiBpbiB0aGUgY2FzZSB0aGF0IHR5cGUgPT09IFwibmV3TGlzdGVuZXJcIiEgQmVmb3JlXG4gIC8vIGFkZGluZyBpdCB0byB0aGUgbGlzdGVuZXJzLCBmaXJzdCBlbWl0IFwibmV3TGlzdGVuZXJcIi5cbiAgaWYgKHRoaXMuX2V2ZW50cy5uZXdMaXN0ZW5lcilcbiAgICB0aGlzLmVtaXQoJ25ld0xpc3RlbmVyJywgdHlwZSxcbiAgICAgICAgICAgICAgaXNGdW5jdGlvbihsaXN0ZW5lci5saXN0ZW5lcikgP1xuICAgICAgICAgICAgICBsaXN0ZW5lci5saXN0ZW5lciA6IGxpc3RlbmVyKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAvLyBPcHRpbWl6ZSB0aGUgY2FzZSBvZiBvbmUgbGlzdGVuZXIuIERvbid0IG5lZWQgdGhlIGV4dHJhIGFycmF5IG9iamVjdC5cbiAgICB0aGlzLl9ldmVudHNbdHlwZV0gPSBsaXN0ZW5lcjtcbiAgZWxzZSBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICAvLyBJZiB3ZSd2ZSBhbHJlYWR5IGdvdCBhbiBhcnJheSwganVzdCBhcHBlbmQuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdLnB1c2gobGlzdGVuZXIpO1xuICBlbHNlXG4gICAgLy8gQWRkaW5nIHRoZSBzZWNvbmQgZWxlbWVudCwgbmVlZCB0byBjaGFuZ2UgdG8gYXJyYXkuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gW3RoaXMuX2V2ZW50c1t0eXBlXSwgbGlzdGVuZXJdO1xuXG4gIC8vIENoZWNrIGZvciBsaXN0ZW5lciBsZWFrXG4gIGlmIChpc09iamVjdCh0aGlzLl9ldmVudHNbdHlwZV0pICYmICF0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkKSB7XG4gICAgdmFyIG07XG4gICAgaWYgKCFpc1VuZGVmaW5lZCh0aGlzLl9tYXhMaXN0ZW5lcnMpKSB7XG4gICAgICBtID0gdGhpcy5fbWF4TGlzdGVuZXJzO1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gRXZlbnRFbWl0dGVyLmRlZmF1bHRNYXhMaXN0ZW5lcnM7XG4gICAgfVxuXG4gICAgaWYgKG0gJiYgbSA+IDAgJiYgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCA+IG0pIHtcbiAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS53YXJuZWQgPSB0cnVlO1xuICAgICAgY29uc29sZS5lcnJvcignKG5vZGUpIHdhcm5pbmc6IHBvc3NpYmxlIEV2ZW50RW1pdHRlciBtZW1vcnkgJyArXG4gICAgICAgICAgICAgICAgICAgICdsZWFrIGRldGVjdGVkLiAlZCBsaXN0ZW5lcnMgYWRkZWQuICcgK1xuICAgICAgICAgICAgICAgICAgICAnVXNlIGVtaXR0ZXIuc2V0TWF4TGlzdGVuZXJzKCkgdG8gaW5jcmVhc2UgbGltaXQuJyxcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fZXZlbnRzW3R5cGVdLmxlbmd0aCk7XG4gICAgICBpZiAodHlwZW9mIGNvbnNvbGUudHJhY2UgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgLy8gbm90IHN1cHBvcnRlZCBpbiBJRSAxMFxuICAgICAgICBjb25zb2xlLnRyYWNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLm9uID0gRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbmNlID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIHZhciBmaXJlZCA9IGZhbHNlO1xuXG4gIGZ1bmN0aW9uIGcoKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBnKTtcblxuICAgIGlmICghZmlyZWQpIHtcbiAgICAgIGZpcmVkID0gdHJ1ZTtcbiAgICAgIGxpc3RlbmVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfVxuICB9XG5cbiAgZy5saXN0ZW5lciA9IGxpc3RlbmVyO1xuICB0aGlzLm9uKHR5cGUsIGcpO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuLy8gZW1pdHMgYSAncmVtb3ZlTGlzdGVuZXInIGV2ZW50IGlmZiB0aGUgbGlzdGVuZXIgd2FzIHJlbW92ZWRcbkV2ZW50RW1pdHRlci5wcm90b3R5cGUucmVtb3ZlTGlzdGVuZXIgPSBmdW5jdGlvbih0eXBlLCBsaXN0ZW5lcikge1xuICB2YXIgbGlzdCwgcG9zaXRpb24sIGxlbmd0aCwgaTtcblxuICBpZiAoIWlzRnVuY3Rpb24obGlzdGVuZXIpKVxuICAgIHRocm93IFR5cGVFcnJvcignbGlzdGVuZXIgbXVzdCBiZSBhIGZ1bmN0aW9uJyk7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXR1cm4gdGhpcztcblxuICBsaXN0ID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuICBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgcG9zaXRpb24gPSAtMTtcblxuICBpZiAobGlzdCA9PT0gbGlzdGVuZXIgfHxcbiAgICAgIChpc0Z1bmN0aW9uKGxpc3QubGlzdGVuZXIpICYmIGxpc3QubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgaWYgKHRoaXMuX2V2ZW50cy5yZW1vdmVMaXN0ZW5lcilcbiAgICAgIHRoaXMuZW1pdCgncmVtb3ZlTGlzdGVuZXInLCB0eXBlLCBsaXN0ZW5lcik7XG5cbiAgfSBlbHNlIGlmIChpc09iamVjdChsaXN0KSkge1xuICAgIGZvciAoaSA9IGxlbmd0aDsgaS0tID4gMDspIHtcbiAgICAgIGlmIChsaXN0W2ldID09PSBsaXN0ZW5lciB8fFxuICAgICAgICAgIChsaXN0W2ldLmxpc3RlbmVyICYmIGxpc3RbaV0ubGlzdGVuZXIgPT09IGxpc3RlbmVyKSkge1xuICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb3NpdGlvbiA8IDApXG4gICAgICByZXR1cm4gdGhpcztcblxuICAgIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgICAgbGlzdC5sZW5ndGggPSAwO1xuICAgICAgZGVsZXRlIHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGlzdC5zcGxpY2UocG9zaXRpb24sIDEpO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUFsbExpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIGtleSwgbGlzdGVuZXJzO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzKVxuICAgIHJldHVybiB0aGlzO1xuXG4gIC8vIG5vdCBsaXN0ZW5pbmcgZm9yIHJlbW92ZUxpc3RlbmVyLCBubyBuZWVkIHRvIGVtaXRcbiAgaWYgKCF0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMClcbiAgICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIGVsc2UgaWYgKHRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICAvLyBlbWl0IHJlbW92ZUxpc3RlbmVyIGZvciBhbGwgbGlzdGVuZXJzIG9uIGFsbCBldmVudHNcbiAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApIHtcbiAgICBmb3IgKGtleSBpbiB0aGlzLl9ldmVudHMpIHtcbiAgICAgIGlmIChrZXkgPT09ICdyZW1vdmVMaXN0ZW5lcicpIGNvbnRpbnVlO1xuICAgICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoa2V5KTtcbiAgICB9XG4gICAgdGhpcy5yZW1vdmVBbGxMaXN0ZW5lcnMoJ3JlbW92ZUxpc3RlbmVyJyk7XG4gICAgdGhpcy5fZXZlbnRzID0ge307XG4gICAgcmV0dXJuIHRoaXM7XG4gIH1cblxuICBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgaWYgKGlzRnVuY3Rpb24obGlzdGVuZXJzKSkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgbGlzdGVuZXJzKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBMSUZPIG9yZGVyXG4gICAgd2hpbGUgKGxpc3RlbmVycy5sZW5ndGgpXG4gICAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVyc1tsaXN0ZW5lcnMubGVuZ3RoIC0gMV0pO1xuICB9XG4gIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmxpc3RlbmVycyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCF0aGlzLl9ldmVudHMgfHwgIXRoaXMuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSBbXTtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbih0aGlzLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IFt0aGlzLl9ldmVudHNbdHlwZV1dO1xuICBlbHNlXG4gICAgcmV0ID0gdGhpcy5fZXZlbnRzW3R5cGVdLnNsaWNlKCk7XG4gIHJldHVybiByZXQ7XG59O1xuXG5FdmVudEVtaXR0ZXIubGlzdGVuZXJDb3VudCA9IGZ1bmN0aW9uKGVtaXR0ZXIsIHR5cGUpIHtcbiAgdmFyIHJldDtcbiAgaWYgKCFlbWl0dGVyLl9ldmVudHMgfHwgIWVtaXR0ZXIuX2V2ZW50c1t0eXBlXSlcbiAgICByZXQgPSAwO1xuICBlbHNlIGlmIChpc0Z1bmN0aW9uKGVtaXR0ZXIuX2V2ZW50c1t0eXBlXSkpXG4gICAgcmV0ID0gMTtcbiAgZWxzZVxuICAgIHJldCA9IGVtaXR0ZXIuX2V2ZW50c1t0eXBlXS5sZW5ndGg7XG4gIHJldHVybiByZXQ7XG59O1xuXG5mdW5jdGlvbiBpc0Z1bmN0aW9uKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ2Z1bmN0aW9uJztcbn1cblxuZnVuY3Rpb24gaXNOdW1iZXIoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnbnVtYmVyJztcbn1cblxuZnVuY3Rpb24gaXNPYmplY3QoYXJnKSB7XG4gIHJldHVybiB0eXBlb2YgYXJnID09PSAnb2JqZWN0JyAmJiBhcmcgIT09IG51bGw7XG59XG5cbmZ1bmN0aW9uIGlzVW5kZWZpbmVkKGFyZykge1xuICByZXR1cm4gYXJnID09PSB2b2lkIDA7XG59XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgb25TdWJtaXQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJhY3Rpdml0eS5uYW1lXCIgcmVmPVwibmFtZVwiIC8+XG4gICAgICAgIDxidXR0b24+IFN0YXJ0IFRyYWNraW5nIDwvYnV0dG9uPlxuICAgICAgPC9mb3JtPlxuICAgIClcbiAgfVxuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bD5cbiAgICAgIDwvdWw+XG4gICAgKVxuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBBY3Rpdml0eUZvcm0gPSByZXF1aXJlKCcuL2FjdGl2aXR5LWZvcm0nKTtcbmNvbnN0IEFjdGl2aXR5TGlzdCA9IHJlcXVpcmUoJy4vYWN0aXZpdHktbGlzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPiBBY3Rpdml0eSA8L2gzPlxuICAgICAgICA8QWN0aXZpdHlGb3JtIC8+XG4gICAgICAgIDxBY3Rpdml0eUxpc3QgLz5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG59KTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgVEFTS1M6IHtcbiAgICBDT01QTEVURTogJ3Rhc2s6Y29tcGxldGUnLFxuICAgIENSRUFURTogJ3Rhc2s6Y3JlYXRlJyxcbiAgICBERVNUUk9ZOiAndGFzazpkZXN0cm95JyxcbiAgICBVTkRPX0NPTVBMRVRFOiAndGFzazp1bmRvLWNvbXBsZXRlJyxcbiAgICBVUERBVEU6ICd0YXNrOnVwZGF0ZScsXG4gICAgVE9HR0xFX0NPTVBMRVRFX0FMTDogJ3Rhc2tzOmNvbXBsZXRlLWFsbCdcbiAgfSxcblxuICBVU0VSOiB7XG4gICAgQVVUSEVOVElDQVRFRDogJ3VzZXI6YXV0aGVudGljYXRlZCcsXG4gICAgVU5BVVRIRU5USUNBVEVEOiAndXNlcjp1bmF1dGhlbnRpY2F0ZWQnXG4gIH0sXG5cbiAgRklSRUJBU0U6IHtcbiAgICBBRERFRDogJ2NoaWxkX2FkZGVkJ1xuICB9XG5cbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEaXNwYXRjaGVyKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4vZGlzcGF0Y2hlcic7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCByb3V0ZXMgZnJvbSAnLi9yb3V0ZXMnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgZGlzcGF0Y2hlcjogZGlzcGF0Y2hlcixcblxuICBjb25zdGFudHM6IGNvbnN0YW50cyxcblxuICByb3V0ZXM6IHJvdXRlc1xuXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgQXBwIGZyb20gJy4uL3BhZ2VzL2FwcCc7XG5pbXBvcnQgSG9tZSBmcm9tICcuLi9wYWdlcy9ob21lJztcbmltcG9ydCBOb3RGb3VuZCBmcm9tICcuLi9wYWdlcy9ub3QtZm91bmQnO1xuaW1wb3J0IFRhc2tQYWdlIGZyb20gJy4uL3Rhc2tzJztcbmltcG9ydCBBY3Rpdml0eVBhZ2UgZnJvbSAnLi4vYWN0aXZpdHknO1xuaW1wb3J0IFNpZ25VcFBhZ2UgZnJvbSAnLi4vcGFnZXMvc2lnbi11cC5qcyc7XG5cbi8vIERlcGVuZGVuY2llc1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSb3V0ZXIgZnJvbSAncmVhY3Qtcm91dGVyJztcblxubGV0IHJvdXRlcztcbmxldCBSb3V0ZSAgPSBSb3V0ZXIuUm91dGU7XG5sZXQgRGVmYXVsdFJvdXRlID0gUm91dGVyLkRlZmF1bHRSb3V0ZTtcbmxldCBOb3RGb3VuZFJvdXRlID0gUm91dGVyLk5vdEZvdW5kUm91dGU7XG5cbmlmIChQYXJzZS5Vc2VyLmN1cnJlbnQoKSkge1xuICByb3V0ZXMgPSAoXG4gICAgPFJvdXRlIHBhdGg9XCIvXCIgaGFuZGxlcj17QXBwfT5cbiAgICAgIDxEZWZhdWx0Um91dGUgaGFuZGxlcj17SG9tZX0vPlxuICAgICAgPE5vdEZvdW5kUm91dGUgaGFuZGxlcj17Tm90Rm91bmR9Lz5cbiAgICAgIDxSb3V0ZSBwYXRoPVwidGFza3NcIiBoYW5kbGVyPXtUYXNrUGFnZX0vPlxuICAgICAgPFJvdXRlIHBhdGg9XCJhY3Rpdml0eVwiIGhhbmRsZXI9e0FjdGl2aXR5UGFnZX0vPlxuICAgIDwvUm91dGU+XG4gICk7XG59XG5lbHNlIHtcbiAgcm91dGVzID0gKFxuICAgIDxSb3V0ZSBwYXRoPVwiL1wiIGhhbmRsZXI9e0FwcH0+XG4gICAgICA8RGVmYXVsdFJvdXRlIGhhbmRsZXI9e1NpZ25VcFBhZ2V9IC8+XG4gICAgICA8Tm90Rm91bmRSb3V0ZSBoYW5kbGVyPXtOb3RGb3VuZH0vPlxuICAgIDwvUm91dGU+XG4gICk7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcztcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7Um91dGVIYW5kbGVyfSBmcm9tICdyZWFjdC1yb3V0ZXInO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7LyogdGhpcyBpcyB0aGUgaW1wb3J0YW50IHBhcnQgKi99XG4gICAgICAgIDxSb3V0ZUhhbmRsZXIvPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFNpZ25VcCBmcm9tICcuL3NpZ24tdXAuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBhdXRoZW50aWNhdGVkOiBQYXJzZS5Vc2VyLmN1cnJlbnQoKVxuICAgIH1cbiAgfSxcblxuICBjb25uZWN0RHJvcGJveCgpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuYXV0aGVudGljYXRlZCkge1xuXG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgbWFya3VwO1xuXG4gICAgaWYgKCF0aGlzLnN0YXRlLmF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIG1hcmt1cCA9IDxTaWduVXAvPjtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFya3VwID0gKFxuICAgICAgICA8YnV0dG9uPlxuICAgICAgICAgIDxhIGhyZWY9XCIjL3Rhc2tzXCI+VGFza3M8L2E+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBob21lXCI+XG4gICAgICAgIHttYXJrdXB9XG4gICAgICA8L3NlY3Rpb24+XG4gICAgKVxuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jbGFzcyBOb3RGb3VuZCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aDE+IFdoYXQgWW91IFRhbGtpbmcgQWJvdXQsIFdpbGxpcz88L2gxPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59XG5cblxuZXhwb3J0IGRlZmF1bHQgTm90Rm91bmQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IFNpZ25VcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHVzZXI6IG5ldyBQYXJzZS5Vc2VyKClcbiAgICB9XG4gIH0sXG5cbiAgb25TdWJtaXQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCBlbWFpbCA9IHRoaXMucmVmcy5lbWFpbC5nZXRET01Ob2RlKCkudmFsdWU7XG4gICAgbGV0IHBhc3N3b3JkID0gdGhpcy5yZWZzLnBhc3N3b3JkLmdldERPTU5vZGUoKS52YWx1ZTtcbiAgICBsZXQgcGFzc3dvcmRDb25maXJtYXRpb24gPSB0aGlzLnJlZnMucGFzc3dvcmRDb25maXJtYXRpb24uZ2V0RE9NTm9kZSgpLnZhbHVlO1xuICAgIGxldCBhbGxWYWx1ZXMgPSBlbWFpbCAmJiBwYXNzd29yZCAmJiBwYXNzd29yZENvbmZpcm1hdGlvbjtcbiAgICBsZXQgbWF0Y2hpbmdQYXNzd29yZHMgPSBwYXNzd29yZCA9PT0gcGFzc3dvcmRDb25maXJtYXRpb247XG5cbiAgICBpZiAoYWxsVmFsdWVzICYmIG1hdGNoaW5nUGFzc3dvcmRzKSB7XG4gICAgICB0aGlzLnN0YXRlLnVzZXIuc2V0KCd1c2VybmFtZScsIGVtYWlsKTtcbiAgICAgIHRoaXMuc3RhdGUudXNlci5zZXQoJ3Bhc3N3b3JkJywgcGFzc3dvcmQpO1xuXG4gICAgICB0aGlzLnN0YXRlLnVzZXIuc2lnblVwKG51bGwsIHtcbiAgICAgICAgc3VjY2VzczogZnVuY3Rpb24odXNlcikge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHVzZXIpO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogZnVuY3Rpb24odXNlciwgZXJyb3IpIHtcbiAgICAgICAgICAvLyBTaG93IHRoZSBlcnJvciBtZXNzYWdlIHNvbWV3aGVyZSBhbmQgbGV0IHRoZSB1c2VyIHRyeSBhZ2Fpbi5cbiAgICAgICAgICBhbGVydChcIkVycm9yOiBcIiArIGVycm9yLmNvZGUgKyBcIiBcIiArIGVycm9yLm1lc3NhZ2UpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgIDxpbnB1dCByZWY9XCJlbWFpbFwiIHR5cGU9XCJlbWFpbFwiIHBsYWNlaG9sZGVyPVwiIEVtYWlsIEFkZHJlc3NcIiAvPlxuICAgICAgICA8YnIvPlxuICAgICAgICA8aW5wdXQgcmVmPVwicGFzc3dvcmRcIiB0eXBlPVwicGFzc3dvcmRcIiBwbGFjZWhvbGRlcj1cIiBQYXNzd29yZFwiIC8+XG4gICAgICAgIDxici8+XG4gICAgICAgIDxpbnB1dCByZWY9XCJwYXNzd29yZENvbmZpcm1hdGlvblwiIHR5cGU9XCJwYXNzd29yZFwiIHBsYWNlaG9sZGVyPVwiIFBhc3N3b3JkIENvbmZpcm1hdGlvblwiIC8+XG4gICAgICAgIDxici8+XG4gICAgICAgIDxidXR0b24+IFNpZ24gVXAgPC9idXR0b24+XG4gICAgICA8L2Zvcm0+XG4gICAgKTtcbiAgfVxuXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU2lnblVwO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcblxuICBfb25DbGljayhoYXNodGFnKSB7XG4gICAgLy8gQ2hlY2sgaWYgaGFzaHRhZyBpcyBzYW1lIGFzIGN1cnJlbnRseSBzZWxlY3RlZFxuICAgIGxldCBpc1NlbGVjdGVkID0gdGhpcy5zdGF0ZS5zZWxlY3RlZCA9PT0gaGFzaHRhZztcblxuICAgIC8vIFNldCBzZWxlY3RlZCBoYXNodGFnIHRvIHN0YXRlXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkOiBoYXNodGFnIH0pO1xuXG4gICAgLy8gRGlzcGF0Y2ggc2VhcmNoIGJ5IGhhc2h0YWdcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6ICdzZWFyY2g6aGFzaHRhZycsXG4gICAgICBkYXRhOiBpc1NlbGVjdGVkID8gdW5kZWZpbmVkIDogaGFzaHRhZ1xuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cInRhc2staGFzaHRhZ3MtbGlzdFwiPlxuICAgICAgICB7dGhpcy5wcm9wcy5oYXNodGFncy5tYXAoKGhhc2hUYWcpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpIGtleT17aGFzaFRhZ31cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3tzZWxlY3RlZDogdGhpcy5zdGF0ZS5zZWxlY3RlZCA9PT0gaGFzaFRhZyB9fT5cbiAgICAgICAgICAgICAgPGEgb25DbGljaz17dGhpcy5fb25DbGljay5iaW5kKHRoaXMsIGhhc2hUYWcpfT5cbiAgICAgICAgICAgICAgICB7e2hhc2hUYWd9fVxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICk7XG4gICAgICAgIH0pfVxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG5cbn0pO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgVGFza0xpc3QgZnJvbSAnLi90YXNrLWxpc3QnO1xuaW1wb3J0IFRhc2tzIGZyb20gJy4vc3RvcmUnO1xuaW1wb3J0IFRhc2tGb3JtIGZyb20gJy4vdGFzay1mb3JtJztcbmltcG9ydCBIYXNodGFncyBmcm9tICcuL2hhc2h0YWdzJztcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4uL2FwcC9kaXNwYXRjaGVyJztcblxuY2xhc3MgVGFza1BhZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGxvYWRlZDogVGFza3MuX2lzTG9hZGVkLFxuICAgICAgdGFza3M6ICBUYXNrcy5faXNMb2FkZWQgPyBUYXNrcy5jb2xsZWN0aW9uLm1vZGVscyA6IFtdXG4gICAgfVxuICB9XG5cbiAgX29uQ2hhbmdlKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoeyB0YXNrczogVGFza3MuY29sbGVjdGlvbi5tb2RlbHMgfSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgVGFza3MuY29sbGVjdGlvbi5sb2FkKClcbiAgICAgIC50aGVuKChjb2xsZWN0aW9uKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBsb2FkZWQ6IHRydWUsXG4gICAgICAgICAgdGFza3M6IGNvbGxlY3Rpb24ubW9kZWxzXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAvLyBSZWdpc3RlciB3aXRoIGFwcCBkaXNwYXRjaGVyXG4gICAgdGhpcy50b2tlbiA9IGRpc3BhdGNoZXIucmVnaXN0ZXIoKHBheWxvYWQpID0+IHtcbiAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb25UeXBlKSB7XG4gICAgICAgIGNhc2UgJ3NlYXJjaDpoYXNodGFnJzpcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRhc2tzOiBUYXNrcy5nZXRCeUhhc2h0YWcocGF5bG9hZC5kYXRhKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0YXNrczpsb2FkJzpcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxvYWRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHRhc2tzOiBUYXNrcy50YWJsZS5xdWVyeSgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBXYXRjaCBmb3IgY2hhbmdlcyB0byBUYXNrc1xuICAgIFRhc2tzLmNvbGxlY3Rpb24ub24oJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgLy8gVW5yZWdpc3RlciBmcm9tIGFwcCBkaXNwYXRjaGVyXG4gICAgZGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMudG9rZW4pO1xuICAgIC8vIFVud2F0Y2ggZm9yIGNoYW5nZXMgdG8gVGFza3NcbiAgICBUYXNrcy5jb2xsZWN0aW9uLm9uKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgdGFza3MgPSB0aGlzLnN0YXRlLnRhc2tzO1xuXG4gICAgbGV0IGhhc2h0YWdzID0gdGhpcy5zdGF0ZS5sb2FkZWQgPyBUYXNrcy5jb2xsZWN0aW9uLmdldEhhc2h0YWdzKCkgOiBbXTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZ2VcIj5cbiAgICAgICAgPGg0IGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+IFRhc2tzIDwvaDQ+XG4gICAgICAgIDxIYXNodGFncyBoYXNodGFncz17aGFzaHRhZ3N9Lz5cbiAgICAgICAgPFRhc2tGb3JtIC8+XG4gICAgICAgIHt0aGlzLnN0YXRlLmxvYWRlZCA/IDxUYXNrTGlzdCB0YXNrcz17dGFza3N9Lz4gOiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtc3Bpbm5lciBmYS1zcGluIGZhLTJ4XCI+PC9pPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGFza1BhZ2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXIuanMnO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi9hcHAvY29uc3RhbnRzLmpzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbi8qKlxuICogUmVmZXJlbmNlIHRvIHRoaXMgZmlsZSdzIG1vZHVsZVxuICogQHR5cGUge3t9fVxuICovXG5sZXQgVGFza3MgPSB7fTtcblxuLyoqXG4gKiBXaGV0aGVyIHN0b3JlIGhhcyBiZWVuIGxvYWRlZFxuICogQHR5cGUge2Jvb2xlYW59XG4gKiBAcHJpdmF0ZVxuICovXG5UYXNrcy5pc0xvYWRlZCA9IGZhbHNlO1xuXG4vKipcbiAqIEN1cnJlbnRseSBsb2dnZWQgaW4gdXNlciBpZiBjdXJyZW50IHVzZXJcbiAqIEB0eXBlIHtvYmplY3R9XG4gKi9cblRhc2tzLmN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbmNvbnN0IFRhc2tDb25zdGFudHMgPSBjb25zdGFudHMuVEFTS1M7XG5jb25zdCBDSEFOR0VfRVZFTlQgPSAnY2hhbmdlJztcblxuLyoqXG4gKiBNb2RlbCBmb3IgdGFza3NcbiAqL1xuY29uc3QgVGFzayA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ1Rhc2tPYmplY3QnLCB7XG5cbiAgZ2V0SGFzaHRhZ3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdoYXNodGFncycpIHx8IFtdO1xuICB9XG5cbn0pO1xuXG4vKipcbiAqIENvbGxlY3Rpb24gZm9yIHRhc2tzc1xuICogQHR5cGUge1NlbGVjdGlvbi5leHRlbmR9XG4gKi9cbmxldCBUYXNrQ29sbGVjdGlvbiA9IFBhcnNlLkNvbGxlY3Rpb24uZXh0ZW5kKF8ubWVyZ2UoRXZlbnRFbWl0dGVyLnByb3RvdHlwZSwge1xuXG4gIC8vIFNldCBtb2RlbCBvZiBjb2xsZWN0aW9uXG4gIG1vZGVsOiBUYXNrLFxuXG4gIC8qKlxuICAgKiBUcnVlIGlmIHN0b3JlIGhhcyBiZWVuIGxvYWRlZCwgZmFsc2UgaWYgaXQgaGFzIG5vdFxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICovXG4gIGlzTG9hZGVkOiBmYWxzZSxcblxuICBsb2FkKCkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZXR1cm4gVGFza3MuY29sbGVjdGlvbi5mZXRjaCh7XG4gICAgICAgIHN1Y2Nlc3M6ICguLi5hcmdzKSA9PiB7XG4gICAgICAgICAgVGFza3MuaXNMb2FkZWQgPSB0cnVlO1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKC4uLmFyZ3MpO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKCkgPT4ge1xuICAgICAgICAgIHJldHVybiByZWplY3QoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgdGFza1xuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHRhc2tcbiAgICovXG4gIGFkZFRhc2sodGFzaykge1xuICAgIHRhc2suY29tcGxldGUgPSBmYWxzZTtcbiAgICB0YXNrLmhhc2h0YWdzID0gVGFza3MuY29sbGVjdGlvbi5wYXJzZUhhc2h0YWdzKHRhc2suZGVzY3JpcHRpb24pO1xuICAgIHRoaXMuY3JlYXRlKHRhc2ssIHtcbiAgICAgIHN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICAgICAgcmVzcG9uc2UuY29sbGVjdGlvbi5lbWl0Q2hhbmdlKCk7XG4gICAgICB9LFxuICAgICAgZXJyb3IoKSB7XG4gICAgICAgIGRlYnVnZ2VyO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBVcGRhdGUgYSBUT0RPIGl0ZW0uXG4gICAqIEBwYXJhbSAge3N0cmluZ30gaWRcbiAgICogQHBhcmFtIHtvYmplY3R9IHVwZGF0ZXMgQW4gb2JqZWN0IGxpdGVyYWwgY29udGFpbmluZyBvbmx5IHRoZSBkYXRhIHRvIGJlXG4gICAqICAgICB1cGRhdGVkLlxuICAgKi9cbiAgdXBkYXRlKGlkLCB1cGRhdGVzKSB7XG4gICAgdmFyIHRhc2sgPSB0aGlzLnRhYmxlLnF1ZXJ5KHsgaWQ6IGlkIH0pWzBdO1xuICAgIGlmICh0YXNrKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModXBkYXRlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIHJldHVybiB0YXNrLnNldChrZXksIHVwZGF0ZXNba2V5XSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihgVGFzayAke2lkfSBjb3VsZCBub3QgYmUgZm91bmRgKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBhbGwgb2YgdGhlIFRPRE8gaXRlbXMgd2l0aCB0aGUgc2FtZSBvYmplY3QuXG4gICAqICAgICB0aGUgZGF0YSB0byBiZSB1cGRhdGVkLiAgVXNlZCB0byBtYXJrIGFsbCBUT0RPcyBhcyBjb21wbGV0ZWQuXG4gICAqIEBwYXJhbSAge29iamVjdH0gdXBkYXRlcyBBbiBvYmplY3QgbGl0ZXJhbCBjb250YWluaW5nIG9ubHkgdGhlIGRhdGEgdG8gYmVcbiAgICogICAgIHVwZGF0ZWQuXG4gICAqL1xuICB1cGRhdGVBbGwodXBkYXRlcykge1xuICAgIGxldCB0YXNrcyA9IHRoaXMudGFibGUucXVlcnkoKTtcbiAgICByZXR1cm4gdGFza3MuZm9yRWFjaChmdW5jdGlvbih0YXNrKSB7XG4gICAgICBUYXNrQ29sbGVjdGlvbi51cGRhdGUodGFzay5nZXQoJ2lkJyksIHVwZGF0ZXMpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBEZWxldGUgYSBUT0RPIGl0ZW0uXG4gICAqIEBwYXJhbSAge3N0cmluZ30gaWRcbiAgICovXG4gIGRlc3Ryb3koaWQpIHtcbiAgICBkZWxldGUgX3Rhc2tzW2lkXTtcbiAgfSxcblxuICAvKipcbiAgICogRGVsZXRlIGFsbCB0aGUgY29tcGxldGVkIFRPRE8gaXRlbXMuXG4gICAqL1xuICBkZXN0cm95Q29tcGxldGVkKCkge1xuICAgIGZvciAodmFyIGlkIGluIF90YXNrcykge1xuICAgICAgaWYgKF90YXNrc1tpZF0uY29tcGxldGUpIHtcbiAgICAgICAgZGVzdHJveShpZCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBUZXN0cyB3aGV0aGVyIGFsbCB0aGUgcmVtYWluaW5nIFRPRE8gaXRlbXMgYXJlIG1hcmtlZCBhcyBjb21wbGV0ZWQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBhcmVBbGxDb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaWQgaW4gX3Rhc2tzKSB7XG4gICAgICBpZiAoIV90YXNrc1tpZF0uY29tcGxldGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0IHRoZSBlbnRpcmUgY29sbGVjdGlvbiBvZiBUT0RPcy5cbiAgICogQHJldHVybiB7b2JqZWN0fVxuICAgKi9cbiAgZ2V0QWxsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZS5xdWVyeSgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2V0IHN0b3JlJ3MgcmVjb3JkcyBmaWx0ZXJlZCBvbiBwcm9wZXJ0eSBieSB2YWx1ZVxuICAgKiBAcGFyYW0gIHsqfSBwcm9wZXJ0eSBQcm9wZXJ0eSB0byBmaWx0ZXIgcmVjb3JkcyBvblxuICAgKiBAcGFyYW0gIHsqfSB2YWx1ZSAgICBWYWx1ZSB0byBmaWx0ZXIgZm9yXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgZ2V0QnkocHJvcGVydHksIHZhbHVlLCBub3QpIHtcbiAgICBsZXQgdGFza3MgPSB0aGlzLnRhYmxlLnF1ZXJ5KCk7XG4gICAgaWYgKG5vdClcbiAgICAgIHJldHVybiB0YXNrcy5maWx0ZXIocmVjb3JkID0+IHJlY29yZFtwcm9wZXJ0eV0gIT09IHZhbHVlKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gdGFza3MuZmlsdGVyKHJlY29yZCA9PiByZWNvcmRbcHJvcGVydHldID09PSB2YWx1ZSk7XG4gIH0sXG5cbiAgZ2V0QnlIYXNodGFnKGhhc2h0YWcpIHtcbiAgICByZXR1cm4gVGFza3MuY29sbGVjdGlvbi5tb2RlbHMuZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgIGxldCB0YWdzID0gdGFzay5nZXQoJ2hhc2h0YWdzJyk7XG4gICAgICByZXR1cm4gdGFncy5sZW5ndGgoKSAmJiB+dGFncy50b0FycmF5KCkuaW5kZXhPZihoYXNodGFnKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdldCBoYXNodGFncyBmcm9tIHN0b3JlJ3MgcmVjb3Jkc1xuICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAqL1xuICBnZXRIYXNodGFncygpIHtcbiAgICByZXR1cm4gVGFza3MuY29sbGVjdGlvbi5tb2RlbHNcbiAgICAgIC5maWx0ZXIoKHRhc2spPT4ge1xuICAgICAgICByZXR1cm4gdGFzay5nZXRIYXNodGFncygpLmxlbmd0aDtcbiAgICAgIH0pXG4gICAgICAubWFwKCh0YXNrKSA9PiB0YXNrLmdldCgnaGFzaHRhZ3MnKSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHZXQgYXJyYXkgb2YgaGFzaHRhZ3MgZnJvbSB0ZXh0XG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGV4dCBUZXh0IHRvIHNlYXJjaCBmb3IgaGFzaHRhZ3NcbiAgICogQHJldHVybiB7QXJyYXl9ICAgICAgTGlzdCBvZiBoYXNodGFnc1xuICAgKi9cbiAgcGFyc2VIYXNodGFncyh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQubWF0Y2goLygjW2EtelxcZF1bXFx3LV0qKS9pZykgfHwgW107XG4gIH0sXG5cbiAgZW1pdENoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbWl0KENIQU5HRV9FVkVOVCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqL1xuICBhZGRDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB0aGlzLm9uKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgKi9cbiAgcmVtb3ZlQ2hhbmdlTGlzdGVuZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihDSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG59KSk7XG5cbi8vIFJlZ2lzdGVyIGNhbGxiYWNrIHRvIGhhbmRsZSBhbGwgdXBkYXRlc1xuZGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihhY3Rpb24pIHtcbiAgbGV0IHRleHQ7XG4gIGxldCBjb2xsZWN0aW9uID0gVGFza3MuY29sbGVjdGlvbjtcblxuICBzd2l0Y2goYWN0aW9uLmFjdGlvblR5cGUpIHtcbiAgICBjYXNlIFRhc2tDb25zdGFudHMuQ1JFQVRFOlxuICAgICAgaWYgKGFjdGlvbi5kYXRhLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICBjb2xsZWN0aW9uLmFkZFRhc2soYWN0aW9uLmRhdGEpO1xuICAgICAgICBjb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLlRPR0dMRV9DT01QTEVURV9BTEw6XG4gICAgICBpZiAoVGFza3MuYXJlQWxsQ29tcGxldGUoKSkge1xuICAgICAgICBjb2xsZWN0aW9uLnVwZGF0ZUFsbCh7Y29tcGxldGU6IGZhbHNlfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xsZWN0aW9uLnVwZGF0ZUFsbCh7Y29tcGxldGU6IHRydWV9KTtcbiAgICAgIH1cbiAgICAgIGNvbGxlY3Rpb24uZW1pdENoYW5nZSgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuVU5ET19DT01QTEVURTpcbiAgICAgIGNvbGxlY3Rpb24udXBkYXRlKGFjdGlvbi5pZCwge2NvbXBsZXRlOiBmYWxzZX0pO1xuICAgICAgY29sbGVjdGlvbi5lbWl0Q2hhbmdlKCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgVGFza0NvbnN0YW50cy5DT01QTEVURTpcbiAgICAgIGNvbGxlY3Rpb24udXBkYXRlKGFjdGlvbi5pZCwge2NvbXBsZXRlOiB0cnVlfSk7XG4gICAgICBjb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLlVQREFURTpcbiAgICAgIHRleHQgPSBhY3Rpb24udGV4dC50cmltKCk7XG4gICAgICBpZiAodGV4dCAhPT0gJycpIHtcbiAgICAgICAgY29sbGVjdGlvbi51cGRhdGUoYWN0aW9uLmlkLCB7dGV4dDogdGV4dH0pO1xuICAgICAgICBjb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLkRFU1RST1k6XG4gICAgICBhY3Rpb24uZGF0YS5kZXN0cm95KHtcbiAgICAgICAgc3VjY2VzcyhvYmplY3QpIHtcbiAgICAgICAgICBjb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3Iob2JqZWN0LCBlcnIpIHtcbiAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgLy8gbm8gb3BcbiAgfVxuXG59KTtcblxuVGFza3MubW9kZWwgPSBUYXNrO1xuXG5UYXNrcy5jb2xsZWN0aW9uID0gbmV3IFRhc2tDb2xsZWN0aW9uKCk7XG5cbmV4cG9ydCBkZWZhdWx0IFRhc2tzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi9hcHAvY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhhbmRsZSBmb3JtIHN1Ym1pc3Npb25cbiAgICogQHBhcmFtIHtTeW50aGV0aWNFdmVudH0gZXZlbnRcbiAgICovXG4gIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIEVtcHR5IGlucHV0IHZhbHVlXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiAnJyB9KTtcblxuICAgIC8vIERpc3BhdGNoIHRhc2sgY3JlYXRpb24gZXZlbnRcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IGNvbnN0YW50cy5UQVNLUy5DUkVBVEUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnJlZnMubmFtZS5nZXRET01Ob2RlKCkudmFsdWVcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBTZXQgdmFsdWUgb2YgaW5wdXQgZmllbGQgdG8gc3RhdGUudmFsdWUgb24gY2hhbmdlXG4gICAqL1xuICBvbkNoYW5nZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IHRoaXMucmVmcy5uYW1lLmdldERPTU5vZGUoKS52YWx1ZSB9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImNhcmRcIj5cbiAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwidGFzay1mb3JtXCIgb25TdWJtaXQ9e3RoaXMub25TdWJtaXR9PlxuICAgICAgICAgIDxpbnB1dCBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggdGFza3Mgb3IgY3JlYXRlIG5ldyB0YXNrXCJcbiAgICAgICAgICAgICAgICAgcmVmPVwibmFtZVwiXG4gICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9Lz5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgPC9zZWN0aW9uPlxuICAgICk7XG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uL2FwcC9jb25zdGFudHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgb25FZGl0Q2xpY2soKSB7XG5cbiAgfSxcblxuICAvKipcbiAgICogRGVsZXRlIHRhc2tcbiAgICogQHBhcmFtIHtjaGlsZH0gdGFza1xuICAgKi9cbiAgb25EZWxldGVDbGljayh0YXNrKSB7XG4gICAgZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBjb25zdGFudHMuVEFTS1MuREVTVFJPWSxcbiAgICAgIGRhdGE6IHRhc2tcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9XCJ0YXNrLWxpc3RcIj5cbiAgICAgICAge3RoaXMucHJvcHMudGFza3MubWFwKCh0YXNrKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxsaSBrZXk9e3Rhc2suZ2V0KFwib2JqZWN0SWRcIil9IGNsYXNzTmFtZT1cInRhc2stbGlzdC1pdGVtIGNhcmRcIj5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPXt0YXNrLmNvbXBsZXRlZH0gLz5cbiAgICAgICAgICAgICAgPHNwYW4+e3Rhc2suZ2V0KCdkZXNjcmlwdGlvbicpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdWxsLXJpZ2h0XCI+XG4gICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtZWRpdFwiIG9uQ2xpY2s9e3RoaXMub25FZGl0Q2xpY2t9PjwvaT5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1jbG9zZVwiIG9uQ2xpY2s9e3RoaXMub25EZWxldGVDbGljay5iaW5kKHRoaXMsIHRhc2spfT48L2k+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApO1xuICAgICAgICB9KX1cbiAgICAgIDwvdWw+XG4gICAgKTtcbiAgfVxuXG59KTtcbiJdfQ==
