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

},{"../activity":5,"../pages/app":11,"../pages/home":12,"../pages/not-found":14,"../pages/sign-up.js":16,"../tasks":18,"react":"react","react-router":"react-router"}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var Spinner = React.createClass({
  displayName: "Spinner",

  render: function render() {
    var klass = undefined;
    var spin = this.props.spin || false;

    klass = spin ? "fa fa-2x fa-refresh fa-spin" : "fa fa-2x fa-refresh";

    if (this.props.show) {
      return React.createElement("i", { className: klass });
    } else {
      return React.createElement("span", null);
    }
  }
});

module.exports = Spinner;

},{"react":"react"}],11:[function(require,module,exports){
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

},{"../app/dispatcher":7,"react":"react","react-router":"react-router"}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var SignUp = _interopRequire(require("./sign-up.js"));

var LogOut = _interopRequire(require("./log-out-button.js"));

module.exports = React.createClass({
  displayName: "home",

  getInitialState: function getInitialState() {
    return {
      authenticated: Parse.User.current()
    };
  },

  render: function render() {
    var markup = undefined;

    if (!this.state.authenticated) {
      markup = React.createElement(SignUp, null);
    } else {
      // Render log out button to navigation
      React.render(React.createElement(LogOut, null), document.querySelector("#log-out"));

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

},{"./log-out-button.js":13,"./sign-up.js":16,"react":"react"}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var LogOut = React.createClass({
  displayName: "LogOut",

  /**
   * Log out user when button is clicked
   */
  onClick: function onClick() {
    return Parse.User.logOut();
  },

  render: function render() {
    return React.createElement(
      "button",
      { onClick: this.onClick },
      " Log Out "
    );
  }

});

module.exports = LogOut;

},{"react":"react"}],14:[function(require,module,exports){
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

},{"react":"react"}],15:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var PasswordField = React.createClass({
  displayName: "PasswordField",

  onPasswordKeyUp: function onPasswordKeyUp(event) {
    if (event.keyCode == 13) {
      debugger;
    }
  },

  render: function render() {
    if (this.props.userFound) {
      return React.createElement(
        "div",
        null,
        React.createElement("input", { ref: "password",
          type: "password",
          onKeyUp: this.onPasswordKeyUp,
          placeholder: " Password" }),
        React.createElement("br", null),
        React.createElement("br", null)
      );
    } else {
      return React.createElement("span", null);
    }
  }

});

module.exports = PasswordField;

},{"react":"react"}],16:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var PasswordField = _interopRequire(require("./password-field.js"));

var Spinner = _interopRequire(require("../components/spinner.js"));

var SignUp = React.createClass({
  displayName: "SignUp",

  getInitialState: function getInitialState() {
    return {
      user: new Parse.User()
    };
  },

  onUserFindSuccess: function onUserFindSuccess(users) {
    var email = this.refs.email.getDOMNode().value;

    this.setState({
      // Show password field
      userFound: true,
      // Stop spinner
      findingUser: false
    });
    //let password = this.refs.password.getDOMNode().value;
    //
    //if (users.length) {
    //  users[0].logIn(email, password, {
    //    success() {
    //      console.log(arguments);
    //    }
    //  })
    //}
    //else {
    //  user.signUp(null, {
    //    success() {
    //      console.log(arguments);
    //    },
    //    error(user, error) {
    //      // Show the error dmessage somewhere and let the user try again.
    //      alert("Error: " + error.code + " " + error.message);
    //    }
    //  });
    //}
  },

  onSubmit: function onSubmit(event) {
    event.preventDefault();
    var user = this.state.user;
    var email = this.refs.email.getDOMNode().value;

    if (email) {
      // Set email to user
      user.set("username", email);

      // Create new query for looking up user
      var query = new Parse.Query(Parse.User);

      // Query by email
      query.equalTo("username", email);

      // Start spinner
      this.setState({
        findingUser: true
      });

      // Find user by email
      query.find({
        success: this.onUserFindSuccess
      });
    }
  },

  render: function render() {
    return React.createElement(
      "form",
      { onSubmit: this.onSubmit },
      React.createElement(
        "div",
        null,
        React.createElement("input", { ref: "email",
          type: "email",
          placeholder: " Email Address",
          disabled: this.state.userFound })
      ),
      React.createElement(Spinner, { show: this.state.findingUser, spin: this.state.findingUser }),
      React.createElement("br", null),
      React.createElement(PasswordField, { userFound: this.state.userFound }),
      React.createElement(
        "button",
        null,
        " Log In "
      )
    );
  }

});

module.exports = SignUp;

},{"../components/spinner.js":10,"./password-field.js":15,"react":"react"}],17:[function(require,module,exports){
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

},{"../app/dispatcher":7,"react":"react"}],18:[function(require,module,exports){
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

},{"../app/dispatcher":7,"./hashtags":17,"./store":19,"./task-form":20,"./task-list":21,"react":"react"}],19:[function(require,module,exports){
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

},{"../app/constants.js":6,"../app/dispatcher.js":7,"events":2,"lodash":"lodash"}],20:[function(require,module,exports){
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

},{"../app/constants":6,"../app/dispatcher":7,"react":"react"}],21:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL21haW4uanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYWN0aXZpdHkvYWN0aXZpdHktZm9ybS5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYWN0aXZpdHkvYWN0aXZpdHktbGlzdC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYWN0aXZpdHkvaW5kZXguanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FwcC9jb25zdGFudHMuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FwcC9kaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvaW5kZXguanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FwcC9yb3V0ZXMuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2NvbXBvbmVudHMvc3Bpbm5lci5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvcGFnZXMvYXBwLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9ob21lLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9sb2ctb3V0LWJ1dHRvbi5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvcGFnZXMvbm90LWZvdW5kLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9wYXNzd29yZC1maWVsZC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvcGFnZXMvc2lnbi11cC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvdGFza3MvaGFzaHRhZ3MuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3Rhc2tzL2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy9zdG9yZS5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvdGFza3MvdGFzay1mb3JtLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy90YXNrLWxpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7QUFFYixNQUFNLENBQUMsS0FBSyxDQUNULFVBQVUsQ0FDVCwwQ0FBMEMsRUFDMUMsMENBQTBDLENBQzNDLENBQUM7O0lBRUcsS0FBSywyQkFBTSxPQUFPOztJQUNsQixNQUFNLDJCQUFNLGNBQWM7O0lBQzFCLEdBQUcsMkJBQU0sT0FBTzs7O0FBR3ZCLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsT0FBTyxFQUFFO0FBQ3hDLE9BQUssQ0FBQyxNQUFNLENBQUMsb0JBQUMsT0FBTyxPQUFFLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0NBQzFELENBQUMsQ0FBQzs7O0FDakJIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbndpbmRvdy5QYXJzZVxuICAuaW5pdGlhbGl6ZShcbiAgICBcIkQxeVV0aEhjUk52VHlhbXllMndSenFBYnpTMmdCNW9YTzE5ZVhlOExcIixcbiAgICBcIjBvZWFKU2dzY3ByaDlTSEdEWkdpZndReHFOcm5uNENEZ3dPbURzc01cIlxuICApO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJvdXRlciBmcm9tICdyZWFjdC1yb3V0ZXInO1xuaW1wb3J0IEFwcCBmcm9tICcuL2FwcCc7XG5cbi8vIEluaXRpYWxpemUgVG91Y2hFdmVudHNcblJlYWN0LmluaXRpYWxpemVUb3VjaEV2ZW50cyh0cnVlKTtcblxuUm91dGVyLnJ1bihBcHAucm91dGVzLCBmdW5jdGlvbiAoSGFuZGxlcikge1xuICBSZWFjdC5yZW5kZXIoPEhhbmRsZXIvPiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FwcCcpKTtcbn0pO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25TdWJtaXR9PlxuICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiYWN0aXZpdHkubmFtZVwiIHJlZj1cIm5hbWVcIiAvPlxuICAgICAgICA8YnV0dG9uPiBTdGFydCBUcmFja2luZyA8L2J1dHRvbj5cbiAgICAgIDwvZm9ybT5cbiAgICApXG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8dWw+XG4gICAgICA8L3VsPlxuICAgIClcbiAgfVxuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgQWN0aXZpdHlGb3JtID0gcmVxdWlyZSgnLi9hY3Rpdml0eS1mb3JtJyk7XG5jb25zdCBBY3Rpdml0eUxpc3QgPSByZXF1aXJlKCcuL2FjdGl2aXR5LWxpc3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj4gQWN0aXZpdHkgPC9oMz5cbiAgICAgICAgPEFjdGl2aXR5Rm9ybSAvPlxuICAgICAgICA8QWN0aXZpdHlMaXN0IC8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxufSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIFRBU0tTOiB7XG4gICAgQ09NUExFVEU6ICd0YXNrOmNvbXBsZXRlJyxcbiAgICBDUkVBVEU6ICd0YXNrOmNyZWF0ZScsXG4gICAgREVTVFJPWTogJ3Rhc2s6ZGVzdHJveScsXG4gICAgRURJVDogJ3Rhc2s6ZWRpdCcsXG4gICAgVU5ET19DT01QTEVURTogJ3Rhc2s6dW5kby1jb21wbGV0ZScsXG4gICAgVVBEQVRFOiAndGFzazp1cGRhdGUnLFxuICAgIFRPR0dMRV9DT01QTEVURV9BTEw6ICd0YXNrczpjb21wbGV0ZS1hbGwnXG4gIH0sXG5cbiAgVVNFUjoge1xuICAgIEFVVEhFTlRJQ0FURUQ6ICd1c2VyOmF1dGhlbnRpY2F0ZWQnLFxuICAgIFVOQVVUSEVOVElDQVRFRDogJ3VzZXI6dW5hdXRoZW50aWNhdGVkJ1xuICB9LFxuXG4gIEZJUkVCQVNFOiB7XG4gICAgQURERUQ6ICdjaGlsZF9hZGRlZCdcbiAgfVxuXG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRGlzcGF0Y2hlcigpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXInO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgcm91dGVzIGZyb20gJy4vcm91dGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIGRpc3BhdGNoZXI6IGRpc3BhdGNoZXIsXG5cbiAgY29uc3RhbnRzOiBjb25zdGFudHMsXG5cbiAgcm91dGVzOiByb3V0ZXNcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IEFwcCBmcm9tICcuLi9wYWdlcy9hcHAnO1xuaW1wb3J0IEhvbWUgZnJvbSAnLi4vcGFnZXMvaG9tZSc7XG5pbXBvcnQgTm90Rm91bmQgZnJvbSAnLi4vcGFnZXMvbm90LWZvdW5kJztcbmltcG9ydCBUYXNrUGFnZSBmcm9tICcuLi90YXNrcyc7XG5pbXBvcnQgQWN0aXZpdHlQYWdlIGZyb20gJy4uL2FjdGl2aXR5JztcbmltcG9ydCBTaWduVXBQYWdlIGZyb20gJy4uL3BhZ2VzL3NpZ24tdXAuanMnO1xuXG4vLyBEZXBlbmRlbmNpZXNcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUm91dGVyIGZyb20gJ3JlYWN0LXJvdXRlcic7XG5cbmxldCByb3V0ZXM7XG5sZXQgUm91dGUgID0gUm91dGVyLlJvdXRlO1xubGV0IERlZmF1bHRSb3V0ZSA9IFJvdXRlci5EZWZhdWx0Um91dGU7XG5sZXQgTm90Rm91bmRSb3V0ZSA9IFJvdXRlci5Ob3RGb3VuZFJvdXRlO1xuXG5pZiAoUGFyc2UuVXNlci5jdXJyZW50KCkpIHtcbiAgcm91dGVzID0gKFxuICAgIDxSb3V0ZSBwYXRoPVwiL1wiIGhhbmRsZXI9e0FwcH0+XG4gICAgICA8RGVmYXVsdFJvdXRlIGhhbmRsZXI9e0hvbWV9Lz5cbiAgICAgIDxOb3RGb3VuZFJvdXRlIGhhbmRsZXI9e05vdEZvdW5kfS8+XG4gICAgICA8Um91dGUgcGF0aD1cInRhc2tzXCIgaGFuZGxlcj17VGFza1BhZ2V9Lz5cbiAgICAgIDxSb3V0ZSBwYXRoPVwiYWN0aXZpdHlcIiBoYW5kbGVyPXtBY3Rpdml0eVBhZ2V9Lz5cbiAgICA8L1JvdXRlPlxuICApO1xufVxuZWxzZSB7XG4gIHJvdXRlcyA9IChcbiAgICA8Um91dGUgcGF0aD1cIi9cIiBoYW5kbGVyPXtBcHB9PlxuICAgICAgPERlZmF1bHRSb3V0ZSBoYW5kbGVyPXtTaWduVXBQYWdlfSAvPlxuICAgICAgPE5vdEZvdW5kUm91dGUgaGFuZGxlcj17Tm90Rm91bmR9Lz5cbiAgICA8L1JvdXRlPlxuICApO1xufVxuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IFNwaW5uZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBrbGFzcztcbiAgICBsZXQgc3BpbiA9IHRoaXMucHJvcHMuc3BpbiB8fCBmYWxzZTtcblxuICAgIGtsYXNzID0gc3BpbiA/IFwiZmEgZmEtMnggZmEtcmVmcmVzaCBmYS1zcGluXCIgOiBcImZhIGZhLTJ4IGZhLXJlZnJlc2hcIjtcblxuICAgIGlmICh0aGlzLnByb3BzLnNob3cpIHtcbiAgICAgIHJldHVybiAoXG4gICAgICAgIDxpIGNsYXNzTmFtZT17a2xhc3N9PjwvaT5cbiAgICAgICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuICg8c3Bhbj48L3NwYW4+KTtcbiAgICB9XG4gIH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBTcGlubmVyO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtSb3V0ZUhhbmRsZXJ9IGZyb20gJ3JlYWN0LXJvdXRlcic7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlcic7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIHsvKiB0aGlzIGlzIHRoZSBpbXBvcnRhbnQgcGFydCAqL31cbiAgICAgICAgPFJvdXRlSGFuZGxlci8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgU2lnblVwIGZyb20gJy4vc2lnbi11cC5qcyc7XG5pbXBvcnQgTG9nT3V0IGZyb20gJy4vbG9nLW91dC1idXR0b24uanMnO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBhdXRoZW50aWNhdGVkOiBQYXJzZS5Vc2VyLmN1cnJlbnQoKVxuICAgIH1cbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgbGV0IG1hcmt1cDtcblxuICAgIGlmICghdGhpcy5zdGF0ZS5hdXRoZW50aWNhdGVkKSB7XG4gICAgICBtYXJrdXAgPSA8U2lnblVwLz47XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIFJlbmRlciBsb2cgb3V0IGJ1dHRvbiB0byBuYXZpZ2F0aW9uXG4gICAgICBSZWFjdC5yZW5kZXIoPExvZ091dC8+LCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbG9nLW91dCcpKTtcblxuICAgICAgbWFya3VwID0gKFxuICAgICAgICA8YnV0dG9uPlxuICAgICAgICAgIDxhIGhyZWY9XCIjL3Rhc2tzXCI+VGFza3M8L2E+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBob21lXCI+XG4gICAgICAgIHttYXJrdXB9XG4gICAgICA8L3NlY3Rpb24+XG4gICAgKVxuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCBMb2dPdXQgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgLyoqXG4gICAqIExvZyBvdXQgdXNlciB3aGVuIGJ1dHRvbiBpcyBjbGlja2VkXG4gICAqL1xuICBvbkNsaWNrKCkge1xuICAgIHJldHVybiBQYXJzZS5Vc2VyLmxvZ091dCgpO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGJ1dHRvbiBvbkNsaWNrPXt0aGlzLm9uQ2xpY2t9PiBMb2cgT3V0IDwvYnV0dG9uPlxuICAgICk7XG4gIH1cblxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IExvZ091dDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY2xhc3MgTm90Rm91bmQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGgxPiBXaGF0IFlvdSBUYWxraW5nIEFib3V0LCBXaWxsaXM/PC9oMT5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IE5vdEZvdW5kO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCBQYXNzd29yZEZpZWxkID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIG9uUGFzc3dvcmRLZXlVcChldmVudCkge1xuICAgIGlmIChldmVudC5rZXlDb2RlID09IDEzKSB7XG4gICAgICBkZWJ1Z2dlcjtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnVzZXJGb3VuZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGRpdj5cbiAgICAgICAgICA8aW5wdXQgcmVmPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICB0eXBlPVwicGFzc3dvcmRcIlxuICAgICAgICAgICAgICAgICBvbktleVVwPXt0aGlzLm9uUGFzc3dvcmRLZXlVcH1cbiAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCIgUGFzc3dvcmRcIi8+XG4gICAgICAgICAgPGJyLz5cbiAgICAgICAgICA8YnIvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIDxzcGFuPjwvc3Bhbj47XG4gICAgfVxuICB9XG5cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBQYXNzd29yZEZpZWxkO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFBhc3N3b3JkRmllbGQgZnJvbSAnLi9wYXNzd29yZC1maWVsZC5qcyc7XG5pbXBvcnQgU3Bpbm5lciBmcm9tICcuLi9jb21wb25lbnRzL3NwaW5uZXIuanMnO1xuXG5jb25zdCBTaWduVXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7XG4gICAgICB1c2VyOiBuZXcgUGFyc2UuVXNlcigpXG4gICAgfVxuICB9LFxuXG4gIG9uVXNlckZpbmRTdWNjZXNzKHVzZXJzKSB7XG4gICAgbGV0IGVtYWlsID0gdGhpcy5yZWZzLmVtYWlsLmdldERPTU5vZGUoKS52YWx1ZTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgLy8gU2hvdyBwYXNzd29yZCBmaWVsZFxuICAgICAgdXNlckZvdW5kOiB0cnVlLFxuICAgICAgLy8gU3RvcCBzcGlubmVyXG4gICAgICBmaW5kaW5nVXNlcjogZmFsc2VcbiAgICB9KTtcbiAgICAvL2xldCBwYXNzd29yZCA9IHRoaXMucmVmcy5wYXNzd29yZC5nZXRET01Ob2RlKCkudmFsdWU7XG4gICAgLy9cbiAgICAvL2lmICh1c2Vycy5sZW5ndGgpIHtcbiAgICAvLyAgdXNlcnNbMF0ubG9nSW4oZW1haWwsIHBhc3N3b3JkLCB7XG4gICAgLy8gICAgc3VjY2VzcygpIHtcbiAgICAvLyAgICAgIGNvbnNvbGUubG9nKGFyZ3VtZW50cyk7XG4gICAgLy8gICAgfVxuICAgIC8vICB9KVxuICAgIC8vfVxuICAgIC8vZWxzZSB7XG4gICAgLy8gIHVzZXIuc2lnblVwKG51bGwsIHtcbiAgICAvLyAgICBzdWNjZXNzKCkge1xuICAgIC8vICAgICAgY29uc29sZS5sb2coYXJndW1lbnRzKTtcbiAgICAvLyAgICB9LFxuICAgIC8vICAgIGVycm9yKHVzZXIsIGVycm9yKSB7XG4gICAgLy8gICAgICAvLyBTaG93IHRoZSBlcnJvciBkbWVzc2FnZSBzb21ld2hlcmUgYW5kIGxldCB0aGUgdXNlciB0cnkgYWdhaW4uXG4gICAgLy8gICAgICBhbGVydChcIkVycm9yOiBcIiArIGVycm9yLmNvZGUgKyBcIiBcIiArIGVycm9yLm1lc3NhZ2UpO1xuICAgIC8vICAgIH1cbiAgICAvLyAgfSk7XG4gICAgLy99XG4gIH0sXG5cbiAgb25TdWJtaXQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCB1c2VyID0gdGhpcy5zdGF0ZS51c2VyO1xuICAgIGxldCBlbWFpbCA9IHRoaXMucmVmcy5lbWFpbC5nZXRET01Ob2RlKCkudmFsdWU7XG5cbiAgICBpZiAoZW1haWwpIHtcbiAgICAgIC8vIFNldCBlbWFpbCB0byB1c2VyXG4gICAgICB1c2VyLnNldCgndXNlcm5hbWUnLCBlbWFpbCk7XG5cbiAgICAgIC8vIENyZWF0ZSBuZXcgcXVlcnkgZm9yIGxvb2tpbmcgdXAgdXNlclxuICAgICAgY29uc3QgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoUGFyc2UuVXNlcik7XG5cbiAgICAgIC8vIFF1ZXJ5IGJ5IGVtYWlsXG4gICAgICBxdWVyeS5lcXVhbFRvKFwidXNlcm5hbWVcIiwgZW1haWwpO1xuXG4gICAgICAvLyBTdGFydCBzcGlubmVyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmluZGluZ1VzZXI6IHRydWVcbiAgICAgIH0pO1xuXG4gICAgICAvLyBGaW5kIHVzZXIgYnkgZW1haWxcbiAgICAgIHF1ZXJ5LmZpbmQoe1xuICAgICAgICBzdWNjZXNzOiB0aGlzLm9uVXNlckZpbmRTdWNjZXNzXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgIDxkaXY+XG4gICAgICAgICAgPGlucHV0IHJlZj1cImVtYWlsXCJcbiAgICAgICAgICAgICAgIHR5cGU9XCJlbWFpbFwiXG4gICAgICAgICAgICAgICBwbGFjZWhvbGRlcj1cIiBFbWFpbCBBZGRyZXNzXCJcbiAgICAgICAgICAgICAgIGRpc2FibGVkPXt0aGlzLnN0YXRlLnVzZXJGb3VuZH0vPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPFNwaW5uZXIgc2hvdz17dGhpcy5zdGF0ZS5maW5kaW5nVXNlcn0gc3Bpbj17dGhpcy5zdGF0ZS5maW5kaW5nVXNlcn0vPlxuICAgICAgICA8YnIvPlxuICAgICAgICA8UGFzc3dvcmRGaWVsZCB1c2VyRm91bmQ9e3RoaXMuc3RhdGUudXNlckZvdW5kfS8+XG4gICAgICAgIDxidXR0b24+IExvZyBJbiA8L2J1dHRvbj5cbiAgICAgIDwvZm9ybT5cbiAgICApO1xuICB9XG5cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBTaWduVXA7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlcic7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuXG4gIF9vbkNsaWNrKGhhc2h0YWcpIHtcbiAgICAvLyBDaGVjayBpZiBoYXNodGFnIGlzIHNhbWUgYXMgY3VycmVudGx5IHNlbGVjdGVkXG4gICAgbGV0IGlzU2VsZWN0ZWQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkID09PSBoYXNodGFnO1xuXG4gICAgLy8gU2V0IHNlbGVjdGVkIGhhc2h0YWcgdG8gc3RhdGVcbiAgICB0aGlzLnNldFN0YXRlKHsgc2VsZWN0ZWQ6IGhhc2h0YWcgfSk7XG5cbiAgICAvLyBEaXNwYXRjaCBzZWFyY2ggYnkgaGFzaHRhZ1xuICAgIGRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogJ3NlYXJjaDpoYXNodGFnJyxcbiAgICAgIGRhdGE6IGlzU2VsZWN0ZWQgPyB1bmRlZmluZWQgOiBoYXNodGFnXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwidGFzay1oYXNodGFncy1saXN0XCI+XG4gICAgICAgIHt0aGlzLnByb3BzLmhhc2h0YWdzLm1hcCgoaGFzaFRhZykgPT4ge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8bGkga2V5PXtoYXNoVGFnfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17e3NlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkID09PSBoYXNoVGFnIH19PlxuICAgICAgICAgICAgICA8YSBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrLmJpbmQodGhpcywgaGFzaFRhZyl9PlxuICAgICAgICAgICAgICAgIHt7aGFzaFRhZ319XG4gICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH1cblxufSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBUYXNrTGlzdCBmcm9tICcuL3Rhc2stbGlzdCc7XG5pbXBvcnQgVGFza3MgZnJvbSAnLi9zdG9yZSc7XG5pbXBvcnQgVGFza0Zvcm0gZnJvbSAnLi90YXNrLWZvcm0nO1xuaW1wb3J0IEhhc2h0YWdzIGZyb20gJy4vaGFzaHRhZ3MnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuXG5jbGFzcyBUYXNrUGFnZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbG9hZGVkOiBUYXNrcy5faXNMb2FkZWQsXG4gICAgICB0YXNrczogIFRhc2tzLl9pc0xvYWRlZCA/IFRhc2tzLmNvbGxlY3Rpb24ubW9kZWxzIDogW11cbiAgICB9XG4gIH1cblxuICBfb25DaGFuZ2UoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHRhc2tzOiBUYXNrcy5jb2xsZWN0aW9uLm1vZGVscyB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICBUYXNrcy5jb2xsZWN0aW9uLmxvYWQoKVxuICAgICAgLnRoZW4oKHRhc2tzKSA9PiB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBsb2FkZWQ6IHRydWUsXG4gICAgICAgICAgdGFza3M6IHRhc2tzXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAvLyBSZWdpc3RlciB3aXRoIGFwcCBkaXNwYXRjaGVyXG4gICAgdGhpcy50b2tlbiA9IGRpc3BhdGNoZXIucmVnaXN0ZXIoKHBheWxvYWQpID0+IHtcbiAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb25UeXBlKSB7XG4gICAgICAgIGNhc2UgJ3NlYXJjaDpoYXNodGFnJzpcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRhc2tzOiBUYXNrcy5nZXRCeUhhc2h0YWcocGF5bG9hZC5kYXRhKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0YXNrczpsb2FkJzpcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxvYWRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHRhc2tzOiBUYXNrcy50YWJsZS5xdWVyeSgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBXYXRjaCBmb3IgY2hhbmdlcyB0byBUYXNrc1xuICAgIFRhc2tzLmNvbGxlY3Rpb24ub24oJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgLy8gVW5yZWdpc3RlciBmcm9tIGFwcCBkaXNwYXRjaGVyXG4gICAgZGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMudG9rZW4pO1xuICAgIC8vIFVud2F0Y2ggZm9yIGNoYW5nZXMgdG8gVGFza3NcbiAgICBUYXNrcy5jb2xsZWN0aW9uLm9uKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgdGFza3MgPSB0aGlzLnN0YXRlLnRhc2tzO1xuXG4gICAgbGV0IGhhc2h0YWdzID0gdGhpcy5zdGF0ZS5sb2FkZWQgPyBUYXNrcy5jb2xsZWN0aW9uLmdldEhhc2h0YWdzKCkgOiBbXTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZ2VcIj5cbiAgICAgICAgPGg0IGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+IFRhc2tzIDwvaDQ+XG4gICAgICAgIDxIYXNodGFncyBoYXNodGFncz17aGFzaHRhZ3N9Lz5cbiAgICAgICAgPFRhc2tGb3JtIC8+XG4gICAgICAgIHt0aGlzLnN0YXRlLmxvYWRlZCA/IDxUYXNrTGlzdCB0YXNrcz17dGFza3N9Lz4gOiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtc3Bpbm5lciBmYS1zcGluIGZhLTJ4XCI+PC9pPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGFza1BhZ2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7RXZlbnRFbWl0dGVyfSBmcm9tICdldmVudHMnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXIuanMnO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi9hcHAvY29uc3RhbnRzLmpzJztcbmltcG9ydCBfIGZyb20gJ2xvZGFzaCc7XG5cbi8qKlxuICogUmVmZXJlbmNlIHRvIHRoaXMgZmlsZSdzIG1vZHVsZVxuICogQHR5cGUge3t9fVxuICovXG5sZXQgVGFza3MgPSB7fTtcblxuLyoqXG4gKiBXaGV0aGVyIHN0b3JlIGhhcyBiZWVuIGxvYWRlZFxuICogQHR5cGUge2Jvb2xlYW59XG4gKiBAcHJpdmF0ZVxuICovXG5UYXNrcy5pc0xvYWRlZCA9IGZhbHNlO1xuXG4vKipcbiAqIEN1cnJlbnRseSBsb2dnZWQgaW4gdXNlciBpZiBjdXJyZW50IHVzZXJcbiAqIEB0eXBlIHtvYmplY3R9XG4gKi9cblRhc2tzLmN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbmNvbnN0IFRhc2tDb25zdGFudHMgPSBjb25zdGFudHMuVEFTS1M7XG5jb25zdCBDSEFOR0VfRVZFTlQgPSAnY2hhbmdlJztcblxuLyoqXG4gKiBNb2RlbCBmb3IgdGFza3NcbiAqL1xuY29uc3QgVGFzayA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ1Rhc2tPYmplY3QnLCB7XG5cbiAgZ2V0SGFzaHRhZ3MoKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0KCdoYXNodGFncycpIHx8IFtdO1xuICB9XG5cbn0pO1xuXG4vKipcbiAqIENvbGxlY3Rpb24gZm9yIHRhc2tzc1xuICogQHR5cGUge1NlbGVjdGlvbi5leHRlbmR9XG4gKi9cbmxldCBUYXNrQ29sbGVjdGlvbiA9IFBhcnNlLkNvbGxlY3Rpb24uZXh0ZW5kKF8ubWVyZ2Uoe1xuXG4gIC8vIFNldCBtb2RlbCBvZiBjb2xsZWN0aW9uXG4gIG1vZGVsOiBUYXNrLFxuXG4gIC8qKlxuICAgKiBUcnVlIGlmIHN0b3JlIGhhcyBiZWVuIGxvYWRlZCwgZmFsc2UgaWYgaXQgaGFzIG5vdFxuICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICovXG4gIGlzTG9hZGVkOiBmYWxzZSxcblxuICBsb2FkKCkge1xuICAgIGxldCBxdWVyeSA9IG5ldyBQYXJzZS5RdWVyeSh0aGlzLm1vZGVsKTtcbiAgICBxdWVyeS5lcXVhbFRvKFwidXNlclwiLCBQYXJzZS5Vc2VyLmN1cnJlbnQoKS5pZCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIHJldHVybiBxdWVyeS5maW5kKHtcbiAgICAgICAgc3VjY2VzczogKHRhc2tzKSA9PiB7XG4gICAgICAgICAgVGFza3MuY29sbGVjdGlvbi5hZGQodGFza3MpO1xuICAgICAgICAgIFRhc2tzLmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSh0YXNrcyk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIHJldHVybiByZWplY3QoLi4uYXJncyk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgdGFza1xuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHRhc2tcbiAgICovXG4gIGFkZFRhc2sodGFzaykge1xuICAgIHRhc2suY29tcGxldGUgPSBmYWxzZTtcblxuICAgIC8vIEdldCBoYXNodGFncyBmcm9tIGRlc2NyaXB0aW9uXG4gICAgdGFzay5oYXNodGFncyA9IFRhc2tzLmNvbGxlY3Rpb24ucGFyc2VIYXNodGFncyh0YXNrLmRlc2NyaXB0aW9uKTtcblxuICAgIC8vIFNldCBjdXJyZW50IHVzZXIncyBpZCB0byB0YXNrXG4gICAgdGFzay51c2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCkuaWQ7XG5cbiAgICAvLyBQT1NUIHRhc2sgdG8gUGFyc2UgQVBJXG4gICAgdGhpcy5jcmVhdGUodGFzaywge1xuICAgICAgc3VjY2VzcyhyZXNwb25zZSkge1xuICAgICAgICByZXNwb25zZS5jb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgIH0sXG4gICAgICBlcnJvcigpIHtcbiAgICAgICAgZGVidWdnZXI7XG4gICAgICB9XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBhIFRPRE8gaXRlbS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBpZFxuICAgKiBAcGFyYW0ge29iamVjdH0gdXBkYXRlcyBBbiBvYmplY3QgbGl0ZXJhbCBjb250YWluaW5nIG9ubHkgdGhlIGRhdGEgdG8gYmVcbiAgICogICAgIHVwZGF0ZWQuXG4gICAqL1xuICB1cGRhdGUoaWQsIHVwZGF0ZXMpIHtcbiAgICB2YXIgdGFzayA9IHRoaXMudGFibGUucXVlcnkoeyBpZDogaWQgfSlbMF07XG4gICAgaWYgKHRhc2spIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyh1cGRhdGVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgcmV0dXJuIHRhc2suc2V0KGtleSwgdXBkYXRlc1trZXldKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uc29sZS53YXJuKGBUYXNrICR7aWR9IGNvdWxkIG5vdCBiZSBmb3VuZGApO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVXBkYXRlIGFsbCBvZiB0aGUgVE9ETyBpdGVtcyB3aXRoIHRoZSBzYW1lIG9iamVjdC5cbiAgICogICAgIHRoZSBkYXRhIHRvIGJlIHVwZGF0ZWQuICBVc2VkIHRvIG1hcmsgYWxsIFRPRE9zIGFzIGNvbXBsZXRlZC5cbiAgICogQHBhcmFtICB7b2JqZWN0fSB1cGRhdGVzIEFuIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5pbmcgb25seSB0aGUgZGF0YSB0byBiZVxuICAgKiAgICAgdXBkYXRlZC5cbiAgICovXG4gIHVwZGF0ZUFsbCh1cGRhdGVzKSB7XG4gICAgbGV0IHRhc2tzID0gdGhpcy50YWJsZS5xdWVyeSgpO1xuICAgIHJldHVybiB0YXNrcy5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgIFRhc2tDb2xsZWN0aW9uLnVwZGF0ZSh0YXNrLmdldCgnaWQnKSwgdXBkYXRlcyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhIFRPRE8gaXRlbS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBpZFxuICAgKi9cbiAgZGVzdHJveShpZCkge1xuICAgIGRlbGV0ZSBfdGFza3NbaWRdO1xuICB9LFxuXG4gIC8qKlxuICAgKiBEZWxldGUgYWxsIHRoZSBjb21wbGV0ZWQgVE9ETyBpdGVtcy5cbiAgICovXG4gIGRlc3Ryb3lDb21wbGV0ZWQoKSB7XG4gICAgZm9yICh2YXIgaWQgaW4gX3Rhc2tzKSB7XG4gICAgICBpZiAoX3Rhc2tzW2lkXS5jb21wbGV0ZSkge1xuICAgICAgICBkZXN0cm95KGlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRlc3RzIHdoZXRoZXIgYWxsIHRoZSByZW1haW5pbmcgVE9ETyBpdGVtcyBhcmUgbWFya2VkIGFzIGNvbXBsZXRlZC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGFyZUFsbENvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpZCBpbiBfdGFza3MpIHtcbiAgICAgIGlmICghX3Rhc2tzW2lkXS5jb21wbGV0ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGVudGlyZSBjb2xsZWN0aW9uIG9mIFRPRE9zLlxuICAgKiBAcmV0dXJuIHtvYmplY3R9XG4gICAqL1xuICBnZXRBbGw6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRhYmxlLnF1ZXJ5KCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHZXQgc3RvcmUncyByZWNvcmRzIGZpbHRlcmVkIG9uIHByb3BlcnR5IGJ5IHZhbHVlXG4gICAqIEBwYXJhbSAgeyp9IHByb3BlcnR5IFByb3BlcnR5IHRvIGZpbHRlciByZWNvcmRzIG9uXG4gICAqIEBwYXJhbSAgeyp9IHZhbHVlICAgIFZhbHVlIHRvIGZpbHRlciBmb3JcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICBnZXRCeShwcm9wZXJ0eSwgdmFsdWUsIG5vdCkge1xuICAgIGxldCB0YXNrcyA9IHRoaXMudGFibGUucXVlcnkoKTtcbiAgICBpZiAobm90KVxuICAgICAgcmV0dXJuIHRhc2tzLmZpbHRlcihyZWNvcmQgPT4gcmVjb3JkW3Byb3BlcnR5XSAhPT0gdmFsdWUpO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiB0YXNrcy5maWx0ZXIocmVjb3JkID0+IHJlY29yZFtwcm9wZXJ0eV0gPT09IHZhbHVlKTtcbiAgfSxcblxuICBnZXRCeUhhc2h0YWcoaGFzaHRhZykge1xuICAgIHJldHVybiBUYXNrcy5jb2xsZWN0aW9uLm1vZGVscy5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xuICAgICAgbGV0IHRhZ3MgPSB0YXNrLmdldCgnaGFzaHRhZ3MnKTtcbiAgICAgIHJldHVybiB0YWdzLmxlbmd0aCgpICYmIH50YWdzLnRvQXJyYXkoKS5pbmRleE9mKGhhc2h0YWcpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2V0IGhhc2h0YWdzIGZyb20gc3RvcmUncyByZWNvcmRzXG4gICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICovXG4gIGdldEhhc2h0YWdzKCkge1xuICAgIHJldHVybiBUYXNrcy5jb2xsZWN0aW9uLm1vZGVsc1xuICAgICAgLmZpbHRlcigodGFzayk9PiB7XG4gICAgICAgIHJldHVybiB0YXNrLmdldEhhc2h0YWdzKCkubGVuZ3RoO1xuICAgICAgfSlcbiAgICAgIC5tYXAoKHRhc2spID0+IHRhc2suZ2V0KCdoYXNodGFncycpKTtcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdldCBhcnJheSBvZiBoYXNodGFncyBmcm9tIHRleHRcbiAgICogQHBhcmFtICB7U3RyaW5nfSB0ZXh0IFRleHQgdG8gc2VhcmNoIGZvciBoYXNodGFnc1xuICAgKiBAcmV0dXJuIHtBcnJheX0gICAgICBMaXN0IG9mIGhhc2h0YWdzXG4gICAqL1xuICBwYXJzZUhhc2h0YWdzKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC5tYXRjaCgvKCNbYS16XFxkXVtcXHctXSopL2lnKSB8fCBbXTtcbiAgfSxcblxuICBlbWl0Q2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnRyaWdnZXIoQ0hBTkdFX0VWRU5UKTtcbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICovXG4gIGFkZENoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHRoaXMub24oQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqL1xuICByZW1vdmVDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG5cbn0pKTtcblxuLy8gUmVnaXN0ZXIgY2FsbGJhY2sgdG8gaGFuZGxlIGFsbCB1cGRhdGVzXG5kaXNwYXRjaGVyLnJlZ2lzdGVyKGZ1bmN0aW9uKGFjdGlvbikge1xuICBsZXQgdGV4dDtcbiAgbGV0IGNvbGxlY3Rpb24gPSBUYXNrcy5jb2xsZWN0aW9uO1xuXG4gIHN3aXRjaChhY3Rpb24uYWN0aW9uVHlwZSkge1xuICAgIGNhc2UgVGFza0NvbnN0YW50cy5DUkVBVEU6XG4gICAgICBpZiAoYWN0aW9uLmRhdGEuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgIGNvbGxlY3Rpb24uYWRkVGFzayhhY3Rpb24uZGF0YSk7XG4gICAgICAgIGNvbGxlY3Rpb24uZW1pdENoYW5nZSgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuVE9HR0xFX0NPTVBMRVRFX0FMTDpcbiAgICAgIGlmIChUYXNrcy5hcmVBbGxDb21wbGV0ZSgpKSB7XG4gICAgICAgIGNvbGxlY3Rpb24udXBkYXRlQWxsKHtjb21wbGV0ZTogZmFsc2V9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbGxlY3Rpb24udXBkYXRlQWxsKHtjb21wbGV0ZTogdHJ1ZX0pO1xuICAgICAgfVxuICAgICAgY29sbGVjdGlvbi5lbWl0Q2hhbmdlKCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgVGFza0NvbnN0YW50cy5VTkRPX0NPTVBMRVRFOlxuICAgICAgY29sbGVjdGlvbi51cGRhdGUoYWN0aW9uLmlkLCB7Y29tcGxldGU6IGZhbHNlfSk7XG4gICAgICBjb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLkNPTVBMRVRFOlxuICAgICAgY29sbGVjdGlvbi51cGRhdGUoYWN0aW9uLmlkLCB7Y29tcGxldGU6IHRydWV9KTtcbiAgICAgIGNvbGxlY3Rpb24uZW1pdENoYW5nZSgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuVVBEQVRFOlxuICAgICAgdGV4dCA9IGFjdGlvbi50ZXh0LnRyaW0oKTtcbiAgICAgIGlmICh0ZXh0ICE9PSAnJykge1xuICAgICAgICBjb2xsZWN0aW9uLnVwZGF0ZShhY3Rpb24uaWQsIHt0ZXh0OiB0ZXh0fSk7XG4gICAgICAgIGNvbGxlY3Rpb24uZW1pdENoYW5nZSgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuREVTVFJPWTpcbiAgICAgIGFjdGlvbi5kYXRhLmRlc3Ryb3koe1xuICAgICAgICBzdWNjZXNzKG9iamVjdCkge1xuICAgICAgICAgIGNvbGxlY3Rpb24uZW1pdENoYW5nZSgpO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcihvYmplY3QsIGVycikge1xuICAgICAgICAgIGRlYnVnZ2VyO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAvLyBubyBvcFxuICB9XG5cbn0pO1xuXG5UYXNrcy5tb2RlbCA9IFRhc2s7XG5cblRhc2tzLmNvbGxlY3Rpb24gPSBuZXcgVGFza0NvbGxlY3Rpb24oKTtcblxuZXhwb3J0IGRlZmF1bHQgVGFza3M7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlcic7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uL2FwcC9jb25zdGFudHMnO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgdGhpcy5kaXNwYXRjaFRva2VuID0gZGlzcGF0Y2hlci5yZWdpc3RlcigocGF5bG9hZCkgPT4ge1xuICAgICAgc3dpdGNoKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICAgICAgICBjYXNlIGNvbnN0YW50cy5UQVNLUy5FRElUOlxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdmFsdWU6IHBheWxvYWQuZGF0YS5nZXQoJ2Rlc2NyaXB0aW9uJylcbiAgICAgICAgICB9KVxuICAgICAgfVxuICAgIH0pXG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgLy8gVW5yZWdpc3RlciBmcm9tIGFwcCBkaXNwYXRjaGVyXG4gICAgZGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMuZGlzcGF0Y2hUb2tlbik7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhhbmRsZSBmb3JtIHN1Ym1pc3Npb25cbiAgICogQHBhcmFtIHtTeW50aGV0aWNFdmVudH0gZXZlbnRcbiAgICovXG4gIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIEVtcHR5IGlucHV0IHZhbHVlXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiAnJyB9KTtcblxuICAgIC8vIERpc3BhdGNoIHRhc2sgY3JlYXRpb24gZXZlbnRcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IGNvbnN0YW50cy5UQVNLUy5DUkVBVEUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnJlZnMubmFtZS5nZXRET01Ob2RlKCkudmFsdWVcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBTZXQgdmFsdWUgb2YgaW5wdXQgZmllbGQgdG8gc3RhdGUudmFsdWUgb24gY2hhbmdlXG4gICAqL1xuICBvbkNoYW5nZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IHRoaXMucmVmcy5uYW1lLmdldERPTU5vZGUoKS52YWx1ZSB9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImNhcmRcIj5cbiAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwidGFzay1mb3JtXCIgb25TdWJtaXQ9e3RoaXMub25TdWJtaXR9PlxuICAgICAgICAgIDxpbnB1dCBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggdGFza3Mgb3IgY3JlYXRlIG5ldyB0YXNrXCJcbiAgICAgICAgICAgICAgICAgcmVmPVwibmFtZVwiXG4gICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9Lz5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgPC9zZWN0aW9uPlxuICAgICk7XG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uL2FwcC9jb25zdGFudHMuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgb25FZGl0Q2xpY2sodGFzaykge1xuICAgIGRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogY29uc3RhbnRzLlRBU0tTLkVESVQsXG4gICAgICBkYXRhOiB0YXNrXG4gICAgfSlcbiAgfSxcblxuICAvKipcbiAgICogRGVsZXRlIHRhc2tcbiAgICogQHBhcmFtIHtjaGlsZH0gdGFza1xuICAgKi9cbiAgb25EZWxldGVDbGljayh0YXNrKSB7XG4gICAgZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBjb25zdGFudHMuVEFTS1MuREVTVFJPWSxcbiAgICAgIGRhdGE6IHRhc2tcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgbGV0IHRhc2tzID0gdGhpcy5wcm9wcy50YXNrcyB8fCBbXTtcblxuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwidGFzay1saXN0XCI+XG4gICAgICAgIHt0YXNrcy5tYXAoKHRhc2spID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpIGtleT17dGFzay5nZXQoXCJvYmplY3RJZFwiKX0gY2xhc3NOYW1lPVwidGFzay1saXN0LWl0ZW0gY2FyZFwiPlxuICAgICAgICAgICAgICA8aW5wdXQgdHlwZT1cImNoZWNrYm94XCIgdmFsdWU9e3Rhc2suY29tcGxldGVkfSAvPlxuICAgICAgICAgICAgICA8c3Bhbj57dGFzay5nZXQoJ2Rlc2NyaXB0aW9uJyl9PC9zcGFuPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB1bGwtcmlnaHRcIj5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1lZGl0XCIgb25DbGljaz17dGhpcy5vbkVkaXRDbGljay5iaW5kKHRoaXMsIHRhc2spfT48L2k+XG4gICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtY2xvc2VcIiBvbkNsaWNrPXt0aGlzLm9uRGVsZXRlQ2xpY2suYmluZCh0aGlzLCB0YXNrKX0+PC9pPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH1cblxufSk7XG4iXX0=
