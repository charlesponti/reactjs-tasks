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

var PlaygroudPage = _interopRequire(require("../pages/playground.js"));

// Dependencies

var React = _interopRequire(require("react"));

var Router = _interopRequire(require("react-router"));

var routes = undefined;
var Route = Router.Route;
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;

//if (Parse.User.current()) {
//  routes = (
//    <Route path="/" handler={App}>
//      <DefaultRoute handler={Home}/>
//      <NotFoundRoute handler={NotFound}/>
//      <Route path="tasks" handler={TaskPage}/>
//      <Route path="activity" handler={ActivityPage}/>
//    </Route>
//  );
//}
//else {
routes = React.createElement(
  Route,
  { path: "/", handler: App },
  React.createElement(DefaultRoute, { handler: SignUpPage }),
  React.createElement(NotFoundRoute, { handler: NotFound }),
  React.createElement(Route, { path: "playground", handler: PlaygroudPage })
);
//}

module.exports = routes;

},{"../activity":5,"../pages/app":15,"../pages/home":16,"../pages/not-found":18,"../pages/playground.js":19,"../pages/sign-up.js":20,"../tasks":22,"react":"react","react-router":"react-router"}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

module.exports = React.createClass({
  displayName: "daterange-field",

  onStartDateChange: function onStartDateChange(event) {
    var value = event.target.value;
  },

  onStartTimeChange: function onStartTimeChange(event) {
    var value = event.target.value;
  },

  onEndDateChange: function onEndDateChange(event) {
    var value = event.target.value;
  },

  onEndTimeChange: function onEndTimeChange(event) {
    var value = event.target.value;
  },

  render: function render() {
    var fieldName = this.props.name;

    return React.createElement(
      "div",
      null,
      React.createElement(
        "fieldset",
        null,
        React.createElement(
          "label",
          null,
          " Start Date "
        ),
        React.createElement("input", { type: "date",
          ref: "startDate",
          name: "" + fieldName + "[startDate]",
          onChange: this.onStartDateChange }),
        React.createElement("input", { type: "time",
          ref: "startTime",
          name: "" + fieldName + "[startTime]",
          onChange: this.onStartTimeChange })
      ),
      React.createElement(
        "fieldset",
        null,
        React.createElement(
          "label",
          null,
          " End Date "
        ),
        React.createElement("input", { type: "date",
          ref: "endDate",
          name: "" + fieldName + "[end]",
          onChange: this.onEndDateChange }),
        React.createElement("input", { type: "time",
          ref: "endTime",
          name: "" + fieldName + "[endTime]",
          onChange: this.onEndTimeChange })
      )
    );
  }

});

},{"react":"react"}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

module.exports = React.createClass({
  displayName: "index",

  getInitialState: function getInitialState() {
    return {
      options: this.constructOptions(this.props.options)
    };
  },

  selectItemByValue: function selectItemByValue(value) {
    var pluck = this.props.pluck;

    var found = _.find(this.state.options, function (item) {
      var val = undefined;

      if (typeof item.value === "object") {
        val = plucker(pluck, item.value);
      } else if (typeof item.value === "string") {
        val = item.value.toLowerCase();
      }

      if (typeof value === "object") {
        return val === plucker(pluck, value);
      } else if (typeof value === "string") {
        return val === value.toLowerCase();
      }

      // Not using type-checking equality because there are times when
      // value is a number and val is a string
      return val == value;
    });

    this.setState({
      selected: found
    });
  },

  constructOptions: function constructOptions(options) {
    var pluck = this.props.pluck;
    return options.map(function (item, index) {
      var type = typeof item;

      var option = {
        itemId: index,
        value: item
      };

      if (type === "string") {
        option.label = item;
      }

      if (type === "object" && pluck) {
        option.label = plucker(pluck, item);
      }

      return option;
    });
  },

  componentDidMount: function componentDidMount() {
    if (this.props.initial) {
      this.setState({
        initial: this.props.initial
      });
    }
  },

  onChange: function onChange() {
    // Emit value
    AppDispatcher.emit("" + this.props.name + ":select", this.state.options[parseInt(value)]);
  },

  onOptionClick: function onOptionClick(option, event) {
    event.stopPropagation();

    this.setState({
      selected: option
    });
  },

  render: function render() {
    var _this = this;

    var spinner = React.createElement("i", { style: "color: darkgray; font-size:20px", className: "fa fa-refresh fa-spin" });
    var selected = this.state.selected;

    return React.createElement(
      "fieldset",
      null,
      React.createElement(
        "label",
        null,
        this.props.label
      ),
      React.createElement(
        "div",
        { className: "dropdown" },
        this.state.loadingItems ? spinner : React.createElement("span", null),
        React.createElement("select", { onChange: this.onChange,
          name: this.props.name,
          value: this.props.initial,
          style: { display: "none" } }),
        React.createElement(
          "a",
          { id: "dLabel", "data-target": "#", href: "#", "data-toggle": "dropdown", "aria-haspopup": "true", role: "button", "aria-expanded": "false" },
          selected ? selected.label : "Select one",
          React.createElement("span", { className: "caret" })
        ),
        React.createElement(
          "ul",
          { className: "dropdown-menu", role: "menu", "aria-labelledby": "dLabel" },
          this.state.options.map(function (option, index) {
            return React.createElement(
              "li",
              { key: index, onClick: _this.onOptionClick.bind(null, option) },
              option.label
            );
          })
        )
      )
    );
  }

});

},{"react":"react"}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

module.exports = React.createClass({
  displayName: "form",

  render: function render() {
    return React.createElement(
      "form",
      null,
      this.props.fields.map(function (field, index) {
        return React.createElement(field, { key: index });
      })
    );
  }

});

},{"react":"react"}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

module.exports = React.createClass({
  displayName: "password-field",

  onPasswordKeyUp: function onPasswordKeyUp(event) {
    if (event.keyCode == 13) {
      debugger;
    }
  },

  render: function render() {
    if (this.props.userFound) {
      return React.createElement(
        "fieldset",
        null,
        React.createElement(
          "label",
          { htmlFor: "password" },
          "Password"
        ),
        React.createElement("input", { ref: "password",
          type: "password",
          onKeyUp: this.onPasswordKeyUp })
      );
    } else {
      return React.createElement("span", null);
    }
  }

});

},{"react":"react"}],14:[function(require,module,exports){
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

},{"react":"react"}],15:[function(require,module,exports){
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

},{"../app/dispatcher":7,"react":"react","react-router":"react-router"}],16:[function(require,module,exports){
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

},{"./log-out-button.js":17,"./sign-up.js":20,"react":"react"}],17:[function(require,module,exports){
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

},{"react":"react"}],18:[function(require,module,exports){
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

},{"react":"react"}],19:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var Form = _interopRequire(require("../components/form.js"));

var Datetime = _interopRequire(require("../components/daterange-field.js"));

var Dropdown = _interopRequire(require("../components/dropdown/index.js"));

module.exports = React.createClass({
  displayName: "playground",

  render: function render() {
    var dropOptions = ["foo", "bar", "baz"];

    return React.createElement(
      "div",
      null,
      React.createElement(
        "h5",
        null,
        " Date Time "
      ),
      React.createElement(Dropdown, { name: "foo", options: dropOptions, label: "Foo" }),
      React.createElement(Form, { fields: [Datetime] })
    );
  }

});

},{"../components/daterange-field.js":10,"../components/dropdown/index.js":11,"../components/form.js":12,"react":"react"}],20:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var PasswordField = _interopRequire(require("../components/password-field.js"));

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
        "fieldset",
        null,
        React.createElement(
          "label",
          { htmlFor: "Email" },
          " Email Address "
        ),
        React.createElement("input", { ref: "email", type: "email",
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

},{"../components/password-field.js":13,"../components/spinner.js":14,"react":"react"}],21:[function(require,module,exports){
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

},{"../app/dispatcher":7,"react":"react"}],22:[function(require,module,exports){
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

},{"../app/dispatcher":7,"./hashtags":21,"./store":23,"./task-form":24,"./task-list":25,"react":"react"}],23:[function(require,module,exports){
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

},{"../app/constants.js":6,"../app/dispatcher.js":7,"events":2,"lodash":"lodash"}],24:[function(require,module,exports){
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

},{"../app/constants":6,"../app/dispatcher":7,"react":"react"}],25:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL21haW4uanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvZXZlbnRzL2V2ZW50cy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYWN0aXZpdHkvYWN0aXZpdHktZm9ybS5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYWN0aXZpdHkvYWN0aXZpdHktbGlzdC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYWN0aXZpdHkvaW5kZXguanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FwcC9jb25zdGFudHMuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FwcC9kaXNwYXRjaGVyLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvaW5kZXguanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FwcC9yb3V0ZXMuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2NvbXBvbmVudHMvZGF0ZXJhbmdlLWZpZWxkLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9jb21wb25lbnRzL2Ryb3Bkb3duL2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9jb21wb25lbnRzL2Zvcm0uanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2NvbXBvbmVudHMvcGFzc3dvcmQtZmllbGQuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2NvbXBvbmVudHMvc3Bpbm5lci5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvcGFnZXMvYXBwLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9ob21lLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9sb2ctb3V0LWJ1dHRvbi5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvcGFnZXMvbm90LWZvdW5kLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9wbGF5Z3JvdW5kLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9zaWduLXVwLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy9oYXNodGFncy5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvdGFza3MvaW5kZXguanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3Rhc2tzL3N0b3JlLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy90YXNrLWZvcm0uanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3Rhc2tzL3Rhc2stbGlzdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7OztBQUViLE1BQU0sQ0FBQyxLQUFLLENBQ1QsVUFBVSxDQUNULDBDQUEwQyxFQUMxQywwQ0FBMEMsQ0FDM0MsQ0FBQzs7SUFFRyxLQUFLLDJCQUFNLE9BQU87O0lBQ2xCLE1BQU0sMkJBQU0sY0FBYzs7SUFDMUIsR0FBRywyQkFBTSxPQUFPOzs7QUFHdkIsS0FBSyxDQUFDLHFCQUFxQixDQUFDLElBQUksQ0FBQyxDQUFDOztBQUVsQyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsVUFBVSxPQUFPLEVBQUU7QUFDeEMsT0FBSyxDQUFDLE1BQU0sQ0FBQyxvQkFBQyxPQUFPLE9BQUUsRUFBRSxRQUFRLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUM7Q0FDMUQsQ0FBQyxDQUFDOzs7QUNqQkg7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LENBQUM7S0FDQyxDQUNMO0dBQ0g7O0NBRUYsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbndpbmRvdy5QYXJzZVxuICAuaW5pdGlhbGl6ZShcbiAgICBcIkQxeVV0aEhjUk52VHlhbXllMndSenFBYnpTMmdCNW9YTzE5ZVhlOExcIixcbiAgICBcIjBvZWFKU2dzY3ByaDlTSEdEWkdpZndReHFOcm5uNENEZ3dPbURzc01cIlxuICApO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJvdXRlciBmcm9tICdyZWFjdC1yb3V0ZXInO1xuaW1wb3J0IEFwcCBmcm9tICcuL2FwcCc7XG5cbi8vIEluaXRpYWxpemUgVG91Y2hFdmVudHNcblJlYWN0LmluaXRpYWxpemVUb3VjaEV2ZW50cyh0cnVlKTtcblxuUm91dGVyLnJ1bihBcHAucm91dGVzLCBmdW5jdGlvbiAoSGFuZGxlcikge1xuICBSZWFjdC5yZW5kZXIoPEhhbmRsZXIvPiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FwcCcpKTtcbn0pO1xuIiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25TdWJtaXR9PlxuICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiYWN0aXZpdHkubmFtZVwiIHJlZj1cIm5hbWVcIiAvPlxuICAgICAgICA8YnV0dG9uPiBTdGFydCBUcmFja2luZyA8L2J1dHRvbj5cbiAgICAgIDwvZm9ybT5cbiAgICApXG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8dWw+XG4gICAgICA8L3VsPlxuICAgIClcbiAgfVxuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgQWN0aXZpdHlGb3JtID0gcmVxdWlyZSgnLi9hY3Rpdml0eS1mb3JtJyk7XG5jb25zdCBBY3Rpdml0eUxpc3QgPSByZXF1aXJlKCcuL2FjdGl2aXR5LWxpc3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj4gQWN0aXZpdHkgPC9oMz5cbiAgICAgICAgPEFjdGl2aXR5Rm9ybSAvPlxuICAgICAgICA8QWN0aXZpdHlMaXN0IC8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxufSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIFRBU0tTOiB7XG4gICAgQ09NUExFVEU6ICd0YXNrOmNvbXBsZXRlJyxcbiAgICBDUkVBVEU6ICd0YXNrOmNyZWF0ZScsXG4gICAgREVTVFJPWTogJ3Rhc2s6ZGVzdHJveScsXG4gICAgRURJVDogJ3Rhc2s6ZWRpdCcsXG4gICAgVU5ET19DT01QTEVURTogJ3Rhc2s6dW5kby1jb21wbGV0ZScsXG4gICAgVVBEQVRFOiAndGFzazp1cGRhdGUnLFxuICAgIFRPR0dMRV9DT01QTEVURV9BTEw6ICd0YXNrczpjb21wbGV0ZS1hbGwnXG4gIH0sXG5cbiAgVVNFUjoge1xuICAgIEFVVEhFTlRJQ0FURUQ6ICd1c2VyOmF1dGhlbnRpY2F0ZWQnLFxuICAgIFVOQVVUSEVOVElDQVRFRDogJ3VzZXI6dW5hdXRoZW50aWNhdGVkJ1xuICB9LFxuXG4gIEZJUkVCQVNFOiB7XG4gICAgQURERUQ6ICdjaGlsZF9hZGRlZCdcbiAgfVxuXG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRGlzcGF0Y2hlcigpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXInO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgcm91dGVzIGZyb20gJy4vcm91dGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIGRpc3BhdGNoZXI6IGRpc3BhdGNoZXIsXG5cbiAgY29uc3RhbnRzOiBjb25zdGFudHMsXG5cbiAgcm91dGVzOiByb3V0ZXNcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IEFwcCBmcm9tICcuLi9wYWdlcy9hcHAnO1xuaW1wb3J0IEhvbWUgZnJvbSAnLi4vcGFnZXMvaG9tZSc7XG5pbXBvcnQgTm90Rm91bmQgZnJvbSAnLi4vcGFnZXMvbm90LWZvdW5kJztcbmltcG9ydCBUYXNrUGFnZSBmcm9tICcuLi90YXNrcyc7XG5pbXBvcnQgQWN0aXZpdHlQYWdlIGZyb20gJy4uL2FjdGl2aXR5JztcbmltcG9ydCBTaWduVXBQYWdlIGZyb20gJy4uL3BhZ2VzL3NpZ24tdXAuanMnO1xuaW1wb3J0IFBsYXlncm91ZFBhZ2UgZnJvbSAnLi4vcGFnZXMvcGxheWdyb3VuZC5qcyc7XG5cbi8vIERlcGVuZGVuY2llc1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSb3V0ZXIgZnJvbSAncmVhY3Qtcm91dGVyJztcblxubGV0IHJvdXRlcztcbmxldCBSb3V0ZSAgPSBSb3V0ZXIuUm91dGU7XG5sZXQgRGVmYXVsdFJvdXRlID0gUm91dGVyLkRlZmF1bHRSb3V0ZTtcbmxldCBOb3RGb3VuZFJvdXRlID0gUm91dGVyLk5vdEZvdW5kUm91dGU7XG5cbi8vaWYgKFBhcnNlLlVzZXIuY3VycmVudCgpKSB7XG4vLyAgcm91dGVzID0gKFxuLy8gICAgPFJvdXRlIHBhdGg9XCIvXCIgaGFuZGxlcj17QXBwfT5cbi8vICAgICAgPERlZmF1bHRSb3V0ZSBoYW5kbGVyPXtIb21lfS8+XG4vLyAgICAgIDxOb3RGb3VuZFJvdXRlIGhhbmRsZXI9e05vdEZvdW5kfS8+XG4vLyAgICAgIDxSb3V0ZSBwYXRoPVwidGFza3NcIiBoYW5kbGVyPXtUYXNrUGFnZX0vPlxuLy8gICAgICA8Um91dGUgcGF0aD1cImFjdGl2aXR5XCIgaGFuZGxlcj17QWN0aXZpdHlQYWdlfS8+XG4vLyAgICA8L1JvdXRlPlxuLy8gICk7XG4vL31cbi8vZWxzZSB7XG4gIHJvdXRlcyA9IChcbiAgICA8Um91dGUgcGF0aD1cIi9cIiBoYW5kbGVyPXtBcHB9PlxuICAgICAgPERlZmF1bHRSb3V0ZSBoYW5kbGVyPXtTaWduVXBQYWdlfSAvPlxuICAgICAgPE5vdEZvdW5kUm91dGUgaGFuZGxlcj17Tm90Rm91bmR9Lz5cbiAgICAgIDxSb3V0ZSBwYXRoPVwicGxheWdyb3VuZFwiIGhhbmRsZXI9e1BsYXlncm91ZFBhZ2V9Lz5cbiAgICA8L1JvdXRlPlxuICApO1xuLy99XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcztcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIG9uU3RhcnREYXRlQ2hhbmdlKGV2ZW50KSB7XG4gICAgbGV0IHZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICB9LFxuXG4gIG9uU3RhcnRUaW1lQ2hhbmdlKGV2ZW50KSB7XG4gICAgbGV0IHZhbHVlID0gZXZlbnQudGFyZ2V0LnZhbHVlO1xuICB9LFxuXG4gIG9uRW5kRGF0ZUNoYW5nZShldmVudCkge1xuICAgIGxldCB2YWx1ZSA9IGV2ZW50LnRhcmdldC52YWx1ZTtcbiAgfSxcblxuICBvbkVuZFRpbWVDaGFuZ2UoZXZlbnQpIHtcbiAgICBsZXQgdmFsdWUgPSBldmVudC50YXJnZXQudmFsdWU7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBmaWVsZE5hbWUgPSB0aGlzLnByb3BzLm5hbWU7XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGZpZWxkc2V0PlxuICAgICAgICAgIDxsYWJlbD4gU3RhcnQgRGF0ZSA8L2xhYmVsPlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwiZGF0ZVwiXG4gICAgICAgICAgICAgICAgIHJlZj1cInN0YXJ0RGF0ZVwiXG4gICAgICAgICAgICAgICAgIG5hbWU9e2Ake2ZpZWxkTmFtZX1bc3RhcnREYXRlXWB9XG4gICAgICAgICAgICAgICAgIG9uQ2hhbmdlPXt0aGlzLm9uU3RhcnREYXRlQ2hhbmdlfS8+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0aW1lXCJcbiAgICAgICAgICAgICAgICAgcmVmPVwic3RhcnRUaW1lXCJcbiAgICAgICAgICAgICAgICAgbmFtZT17YCR7ZmllbGROYW1lfVtzdGFydFRpbWVdYH1cbiAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25TdGFydFRpbWVDaGFuZ2V9Lz5cbiAgICAgICAgPC9maWVsZHNldD5cbiAgICAgICAgPGZpZWxkc2V0PlxuICAgICAgICAgIDxsYWJlbD4gRW5kIERhdGUgPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgdHlwZT1cImRhdGVcIlxuICAgICAgICAgICAgICAgICByZWY9XCJlbmREYXRlXCJcbiAgICAgICAgICAgICAgICAgbmFtZT17YCR7ZmllbGROYW1lfVtlbmRdYH1cbiAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMub25FbmREYXRlQ2hhbmdlfS8+XG4gICAgICAgICAgPGlucHV0IHR5cGU9XCJ0aW1lXCJcbiAgICAgICAgICAgICAgICAgcmVmPVwiZW5kVGltZVwiXG4gICAgICAgICAgICAgICAgIG5hbWU9e2Ake2ZpZWxkTmFtZX1bZW5kVGltZV1gfVxuICAgICAgICAgICAgICAgICBvbkNoYW5nZT17dGhpcy5vbkVuZFRpbWVDaGFuZ2V9Lz5cbiAgICAgICAgPC9maWVsZHNldD5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIG9wdGlvbnM6IHRoaXMuY29uc3RydWN0T3B0aW9ucyh0aGlzLnByb3BzLm9wdGlvbnMpXG4gICAgfTtcbiAgfSxcblxuICBzZWxlY3RJdGVtQnlWYWx1ZSh2YWx1ZSkge1xuICAgIGxldCBwbHVjayA9IHRoaXMucHJvcHMucGx1Y2s7XG5cbiAgICBsZXQgZm91bmQgPSBfLmZpbmQodGhpcy5zdGF0ZS5vcHRpb25zLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICBsZXQgdmFsO1xuXG4gICAgICBpZiAodHlwZW9mIGl0ZW0udmFsdWUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgIHZhbCA9IHBsdWNrZXIocGx1Y2ssIGl0ZW0udmFsdWUpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAodHlwZW9mIGl0ZW0udmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHZhbCA9IGl0ZW0udmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgcmV0dXJuIHZhbCA9PT0gcGx1Y2tlcihwbHVjaywgdmFsdWUpO1xuICAgICAgfVxuICAgICAgZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgICByZXR1cm4gIHZhbCA9PT0gdmFsdWUudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cblxuICAgICAgLy8gTm90IHVzaW5nIHR5cGUtY2hlY2tpbmcgZXF1YWxpdHkgYmVjYXVzZSB0aGVyZSBhcmUgdGltZXMgd2hlblxuICAgICAgLy8gdmFsdWUgaXMgYSBudW1iZXIgYW5kIHZhbCBpcyBhIHN0cmluZ1xuICAgICAgcmV0dXJuIHZhbCA9PSB2YWx1ZTtcbiAgICB9KTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgc2VsZWN0ZWQ6IGZvdW5kXG4gICAgfSk7XG4gIH0sXG5cbiAgY29uc3RydWN0T3B0aW9ucyhvcHRpb25zKSB7XG4gICAgbGV0IHBsdWNrID0gdGhpcy5wcm9wcy5wbHVjaztcbiAgICByZXR1cm4gb3B0aW9ucy5tYXAoZnVuY3Rpb24oaXRlbSwgaW5kZXgpIHtcbiAgICAgIGxldCB0eXBlID0gdHlwZW9mIGl0ZW07XG5cbiAgICAgIGxldCBvcHRpb24gPSB7XG4gICAgICAgIGl0ZW1JZDogaW5kZXgsXG4gICAgICAgIHZhbHVlOiBpdGVtXG4gICAgICB9O1xuXG4gICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgb3B0aW9uLmxhYmVsID0gaXRlbTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGUgPT09ICdvYmplY3QnICYmIHBsdWNrKSB7XG4gICAgICAgIG9wdGlvbi5sYWJlbCA9IHBsdWNrZXIocGx1Y2ssIGl0ZW0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gb3B0aW9uO1xuICAgIH0pO1xuICB9LFxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIGlmICh0aGlzLnByb3BzLmluaXRpYWwpIHtcbiAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICBpbml0aWFsOiB0aGlzLnByb3BzLmluaXRpYWxcbiAgICAgIH0pO1xuICAgIH1cbiAgfSxcblxuICBvbkNoYW5nZSgpIHtcbiAgICAvLyBFbWl0IHZhbHVlXG4gICAgQXBwRGlzcGF0Y2hlci5lbWl0KFxuICAgICAgYCR7dGhpcy5wcm9wcy5uYW1lfTpzZWxlY3RgLFxuICAgICAgdGhpcy5zdGF0ZS5vcHRpb25zW3BhcnNlSW50KHZhbHVlKV0pO1xuICB9LFxuXG4gIG9uT3B0aW9uQ2xpY2sob3B0aW9uLCBldmVudCkge1xuICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICBzZWxlY3RlZDogb3B0aW9uXG4gICAgfSlcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgbGV0IHNwaW5uZXIgPSAoXG4gICAgICA8aSBzdHlsZT1cImNvbG9yOiBkYXJrZ3JheTsgZm9udC1zaXplOjIwcHhcIiBjbGFzc05hbWU9XCJmYSBmYS1yZWZyZXNoIGZhLXNwaW5cIj48L2k+XG4gICAgKTtcbiAgICBsZXQgc2VsZWN0ZWQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxmaWVsZHNldD5cbiAgICAgICAgPGxhYmVsPnt0aGlzLnByb3BzLmxhYmVsfTwvbGFiZWw+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiZHJvcGRvd25cIj5cbiAgICAgICAgICB7dGhpcy5zdGF0ZS5sb2FkaW5nSXRlbXMgPyBzcGlubmVyIDogPHNwYW4+PC9zcGFuPn1cbiAgICAgICAgICA8c2VsZWN0IG9uQ2hhbmdlPXt0aGlzLm9uQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgbmFtZT17dGhpcy5wcm9wcy5uYW1lfVxuICAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMucHJvcHMuaW5pdGlhbH1cbiAgICAgICAgICAgICAgICAgIHN0eWxlPXt7ZGlzcGxheTogJ25vbmUnfX0+XG4gICAgICAgICAgPC9zZWxlY3Q+XG4gICAgICAgICAgPGEgaWQ9XCJkTGFiZWxcIiBkYXRhLXRhcmdldD1cIiNcIiBocmVmPVwiI1wiIGRhdGEtdG9nZ2xlPVwiZHJvcGRvd25cIiBhcmlhLWhhc3BvcHVwPVwidHJ1ZVwiIHJvbGU9XCJidXR0b25cIiBhcmlhLWV4cGFuZGVkPVwiZmFsc2VcIj5cbiAgICAgICAgICAgIHtzZWxlY3RlZCA/IHNlbGVjdGVkLmxhYmVsIDogJ1NlbGVjdCBvbmUnfVxuICAgICAgICAgICAgPHNwYW4gY2xhc3NOYW1lPVwiY2FyZXRcIj48L3NwYW4+XG4gICAgICAgICAgPC9hPlxuXG4gICAgICAgICAgPHVsIGNsYXNzTmFtZT1cImRyb3Bkb3duLW1lbnVcIiByb2xlPVwibWVudVwiIGFyaWEtbGFiZWxsZWRieT1cImRMYWJlbFwiPlxuICAgICAgICAgICAge3RoaXMuc3RhdGUub3B0aW9ucy5tYXAoKG9wdGlvbiwgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgICAgICA8bGkga2V5PXtpbmRleH0gb25DbGljaz17dGhpcy5vbk9wdGlvbkNsaWNrLmJpbmQobnVsbCwgb3B0aW9uKX0+XG4gICAgICAgICAgICAgICAgICB7b3B0aW9uLmxhYmVsfVxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9KX1cbiAgICAgICAgICA8L3VsPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZmllbGRzZXQ+XG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGZvcm0+XG4gICAgICAgIHt0aGlzLnByb3BzLmZpZWxkcy5tYXAoZnVuY3Rpb24oZmllbGQsIGluZGV4KSB7XG4gICAgICAgICAgcmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoZmllbGQsIHsga2V5OiBpbmRleCB9KTtcbiAgICAgICAgfSl9XG4gICAgICA8L2Zvcm0+XG4gICAgKTtcbiAgfVxuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIG9uUGFzc3dvcmRLZXlVcChldmVudCkge1xuICAgIGlmIChldmVudC5rZXlDb2RlID09IDEzKSB7XG4gICAgICBkZWJ1Z2dlcjtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGlmICh0aGlzLnByb3BzLnVzZXJGb3VuZCkge1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPGZpZWxkc2V0PlxuICAgICAgICAgIDxsYWJlbCBodG1sRm9yPVwicGFzc3dvcmRcIj5QYXNzd29yZDwvbGFiZWw+XG4gICAgICAgICAgPGlucHV0IHJlZj1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgdHlwZT1cInBhc3N3b3JkXCJcbiAgICAgICAgICAgICAgICAgb25LZXlVcD17dGhpcy5vblBhc3N3b3JkS2V5VXB9Lz5cbiAgICAgICAgPC9maWVsZHNldD5cbiAgICAgICk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgcmV0dXJuIDxzcGFuPjwvc3Bhbj47XG4gICAgfVxuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCBTcGlubmVyID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQga2xhc3M7XG4gICAgbGV0IHNwaW4gPSB0aGlzLnByb3BzLnNwaW4gfHwgZmFsc2U7XG5cbiAgICBrbGFzcyA9IHNwaW4gPyBcImZhIGZhLTJ4IGZhLXJlZnJlc2ggZmEtc3BpblwiIDogXCJmYSBmYS0yeCBmYS1yZWZyZXNoXCI7XG5cbiAgICBpZiAodGhpcy5wcm9wcy5zaG93KSB7XG4gICAgICByZXR1cm4gKFxuICAgICAgICA8aSBjbGFzc05hbWU9e2tsYXNzfT48L2k+XG4gICAgICApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiAoPHNwYW4+PC9zcGFuPik7XG4gICAgfVxuICB9XG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU3Bpbm5lcjtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7Um91dGVIYW5kbGVyfSBmcm9tICdyZWFjdC1yb3V0ZXInO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7LyogdGhpcyBpcyB0aGUgaW1wb3J0YW50IHBhcnQgKi99XG4gICAgICAgIDxSb3V0ZUhhbmRsZXIvPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFNpZ25VcCBmcm9tICcuL3NpZ24tdXAuanMnO1xuaW1wb3J0IExvZ091dCBmcm9tICcuL2xvZy1vdXQtYnV0dG9uLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYXV0aGVudGljYXRlZDogUGFyc2UuVXNlci5jdXJyZW50KClcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBtYXJrdXA7XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuYXV0aGVudGljYXRlZCkge1xuICAgICAgbWFya3VwID0gPFNpZ25VcC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBSZW5kZXIgbG9nIG91dCBidXR0b24gdG8gbmF2aWdhdGlvblxuICAgICAgUmVhY3QucmVuZGVyKDxMb2dPdXQvPiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xvZy1vdXQnKSk7XG5cbiAgICAgIG1hcmt1cCA9IChcbiAgICAgICAgPGJ1dHRvbj5cbiAgICAgICAgICA8YSBocmVmPVwiIy90YXNrc1wiPlRhc2tzPC9hPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgaG9tZVwiPlxuICAgICAgICB7bWFya3VwfVxuICAgICAgPC9zZWN0aW9uPlxuICAgIClcbiAgfVxuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY29uc3QgTG9nT3V0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIC8qKlxuICAgKiBMb2cgb3V0IHVzZXIgd2hlbiBidXR0b24gaXMgY2xpY2tlZFxuICAgKi9cbiAgb25DbGljaygpIHtcbiAgICByZXR1cm4gUGFyc2UuVXNlci5sb2dPdXQoKTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxidXR0b24gb25DbGljaz17dGhpcy5vbkNsaWNrfT4gTG9nIE91dCA8L2J1dHRvbj5cbiAgICApO1xuICB9XG5cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBMb2dPdXQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNsYXNzIE5vdEZvdW5kIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoMT4gV2hhdCBZb3UgVGFsa2luZyBBYm91dCwgV2lsbGlzPzwvaDE+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBOb3RGb3VuZDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuaW1wb3J0IEZvcm0gZnJvbSAnLi4vY29tcG9uZW50cy9mb3JtLmpzJztcbmltcG9ydCBEYXRldGltZSBmcm9tICcuLi9jb21wb25lbnRzL2RhdGVyYW5nZS1maWVsZC5qcyc7XG5pbXBvcnQgRHJvcGRvd24gZnJvbSAnLi4vY29tcG9uZW50cy9kcm9wZG93bi9pbmRleC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgbGV0IGRyb3BPcHRpb25zID0gW1xuICAgICAgJ2ZvbycsXG4gICAgICAnYmFyJyxcbiAgICAgICdiYXonXG4gICAgXTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aDU+IERhdGUgVGltZSA8L2g1PlxuICAgICAgICA8RHJvcGRvd24gbmFtZT1cImZvb1wiIG9wdGlvbnM9e2Ryb3BPcHRpb25zfSBsYWJlbD1cIkZvb1wiIC8+XG4gICAgICAgIDxGb3JtIGZpZWxkcz17W0RhdGV0aW1lXX0vPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59KVxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFBhc3N3b3JkRmllbGQgZnJvbSAnLi4vY29tcG9uZW50cy9wYXNzd29yZC1maWVsZC5qcyc7XG5pbXBvcnQgU3Bpbm5lciBmcm9tICcuLi9jb21wb25lbnRzL3NwaW5uZXIuanMnO1xuXG5jb25zdCBTaWduVXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7XG4gICAgICB1c2VyOiBuZXcgUGFyc2UuVXNlcigpXG4gICAgfVxuICB9LFxuXG4gIG9uVXNlckZpbmRTdWNjZXNzKHVzZXJzKSB7XG4gICAgbGV0IGVtYWlsID0gdGhpcy5yZWZzLmVtYWlsLmdldERPTU5vZGUoKS52YWx1ZTtcblxuICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgLy8gU2hvdyBwYXNzd29yZCBmaWVsZFxuICAgICAgdXNlckZvdW5kOiB0cnVlLFxuICAgICAgLy8gU3RvcCBzcGlubmVyXG4gICAgICBmaW5kaW5nVXNlcjogZmFsc2VcbiAgICB9KTtcbiAgICAvL2xldCBwYXNzd29yZCA9IHRoaXMucmVmcy5wYXNzd29yZC5nZXRET01Ob2RlKCkudmFsdWU7XG4gICAgLy9cbiAgICAvL2lmICh1c2Vycy5sZW5ndGgpIHtcbiAgICAvLyAgdXNlcnNbMF0ubG9nSW4oZW1haWwsIHBhc3N3b3JkLCB7XG4gICAgLy8gICAgc3VjY2VzcygpIHtcbiAgICAvLyAgICAgIGNvbnNvbGUubG9nKGFyZ3VtZW50cyk7XG4gICAgLy8gICAgfVxuICAgIC8vICB9KVxuICAgIC8vfVxuICAgIC8vZWxzZSB7XG4gICAgLy8gIHVzZXIuc2lnblVwKG51bGwsIHtcbiAgICAvLyAgICBzdWNjZXNzKCkge1xuICAgIC8vICAgICAgY29uc29sZS5sb2coYXJndW1lbnRzKTtcbiAgICAvLyAgICB9LFxuICAgIC8vICAgIGVycm9yKHVzZXIsIGVycm9yKSB7XG4gICAgLy8gICAgICAvLyBTaG93IHRoZSBlcnJvciBkbWVzc2FnZSBzb21ld2hlcmUgYW5kIGxldCB0aGUgdXNlciB0cnkgYWdhaW4uXG4gICAgLy8gICAgICBhbGVydChcIkVycm9yOiBcIiArIGVycm9yLmNvZGUgKyBcIiBcIiArIGVycm9yLm1lc3NhZ2UpO1xuICAgIC8vICAgIH1cbiAgICAvLyAgfSk7XG4gICAgLy99XG4gIH0sXG5cbiAgb25TdWJtaXQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGxldCB1c2VyID0gdGhpcy5zdGF0ZS51c2VyO1xuICAgIGxldCBlbWFpbCA9IHRoaXMucmVmcy5lbWFpbC5nZXRET01Ob2RlKCkudmFsdWU7XG5cbiAgICBpZiAoZW1haWwpIHtcbiAgICAgIC8vIFNldCBlbWFpbCB0byB1c2VyXG4gICAgICB1c2VyLnNldCgndXNlcm5hbWUnLCBlbWFpbCk7XG5cbiAgICAgIC8vIENyZWF0ZSBuZXcgcXVlcnkgZm9yIGxvb2tpbmcgdXAgdXNlclxuICAgICAgY29uc3QgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkoUGFyc2UuVXNlcik7XG5cbiAgICAgIC8vIFF1ZXJ5IGJ5IGVtYWlsXG4gICAgICBxdWVyeS5lcXVhbFRvKFwidXNlcm5hbWVcIiwgZW1haWwpO1xuXG4gICAgICAvLyBTdGFydCBzcGlubmVyXG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZmluZGluZ1VzZXI6IHRydWVcbiAgICAgIH0pO1xuXG4gICAgICAvLyBGaW5kIHVzZXIgYnkgZW1haWxcbiAgICAgIHF1ZXJ5LmZpbmQoe1xuICAgICAgICBzdWNjZXNzOiB0aGlzLm9uVXNlckZpbmRTdWNjZXNzXG4gICAgICB9KTtcbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgIDxmaWVsZHNldD5cbiAgICAgICAgICA8bGFiZWwgaHRtbEZvcj1cIkVtYWlsXCI+IEVtYWlsIEFkZHJlc3MgPC9sYWJlbD5cbiAgICAgICAgICA8aW5wdXQgcmVmPVwiZW1haWxcIiB0eXBlPVwiZW1haWxcIlxuICAgICAgICAgICAgICAgZGlzYWJsZWQ9e3RoaXMuc3RhdGUudXNlckZvdW5kfS8+XG4gICAgICAgIDwvZmllbGRzZXQ+XG4gICAgICAgIDxTcGlubmVyIHNob3c9e3RoaXMuc3RhdGUuZmluZGluZ1VzZXJ9IHNwaW49e3RoaXMuc3RhdGUuZmluZGluZ1VzZXJ9Lz5cbiAgICAgICAgPGJyLz5cbiAgICAgICAgPFBhc3N3b3JkRmllbGQgdXNlckZvdW5kPXt0aGlzLnN0YXRlLnVzZXJGb3VuZH0vPlxuICAgICAgICA8YnV0dG9uPiBMb2cgSW4gPC9idXR0b24+XG4gICAgICA8L2Zvcm0+XG4gICAgKTtcbiAgfVxuXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU2lnblVwO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7fTtcbiAgfSxcblxuICBfb25DbGljayhoYXNodGFnKSB7XG4gICAgLy8gQ2hlY2sgaWYgaGFzaHRhZyBpcyBzYW1lIGFzIGN1cnJlbnRseSBzZWxlY3RlZFxuICAgIGxldCBpc1NlbGVjdGVkID0gdGhpcy5zdGF0ZS5zZWxlY3RlZCA9PT0gaGFzaHRhZztcblxuICAgIC8vIFNldCBzZWxlY3RlZCBoYXNodGFnIHRvIHN0YXRlXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkOiBoYXNodGFnIH0pO1xuXG4gICAgLy8gRGlzcGF0Y2ggc2VhcmNoIGJ5IGhhc2h0YWdcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6ICdzZWFyY2g6aGFzaHRhZycsXG4gICAgICBkYXRhOiBpc1NlbGVjdGVkID8gdW5kZWZpbmVkIDogaGFzaHRhZ1xuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cInRhc2staGFzaHRhZ3MtbGlzdFwiPlxuICAgICAgICB7dGhpcy5wcm9wcy5oYXNodGFncy5tYXAoKGhhc2hUYWcpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpIGtleT17aGFzaFRhZ31cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3tzZWxlY3RlZDogdGhpcy5zdGF0ZS5zZWxlY3RlZCA9PT0gaGFzaFRhZyB9fT5cbiAgICAgICAgICAgICAgPGEgb25DbGljaz17dGhpcy5fb25DbGljay5iaW5kKHRoaXMsIGhhc2hUYWcpfT5cbiAgICAgICAgICAgICAgICB7e2hhc2hUYWd9fVxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICk7XG4gICAgICAgIH0pfVxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG5cbn0pO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgVGFza0xpc3QgZnJvbSAnLi90YXNrLWxpc3QnO1xuaW1wb3J0IFRhc2tzIGZyb20gJy4vc3RvcmUnO1xuaW1wb3J0IFRhc2tGb3JtIGZyb20gJy4vdGFzay1mb3JtJztcbmltcG9ydCBIYXNodGFncyBmcm9tICcuL2hhc2h0YWdzJztcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4uL2FwcC9kaXNwYXRjaGVyJztcblxuY2xhc3MgVGFza1BhZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGxvYWRlZDogVGFza3MuX2lzTG9hZGVkLFxuICAgICAgdGFza3M6ICBUYXNrcy5faXNMb2FkZWQgPyBUYXNrcy5jb2xsZWN0aW9uLm1vZGVscyA6IFtdXG4gICAgfVxuICB9XG5cbiAgX29uQ2hhbmdlKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoeyB0YXNrczogVGFza3MuY29sbGVjdGlvbi5tb2RlbHMgfSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgVGFza3MuY29sbGVjdGlvbi5sb2FkKClcbiAgICAgIC50aGVuKCh0YXNrcykgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgbG9hZGVkOiB0cnVlLFxuICAgICAgICAgIHRhc2tzOiB0YXNrc1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgLy8gUmVnaXN0ZXIgd2l0aCBhcHAgZGlzcGF0Y2hlclxuICAgIHRoaXMudG9rZW4gPSBkaXNwYXRjaGVyLnJlZ2lzdGVyKChwYXlsb2FkKSA9PiB7XG4gICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICAgICAgICBjYXNlICdzZWFyY2g6aGFzaHRhZyc6XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0YXNrczogVGFza3MuZ2V0QnlIYXNodGFnKHBheWxvYWQuZGF0YSlcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndGFza3M6bG9hZCc6XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkZWQ6IHRydWUsXG4gICAgICAgICAgICB0YXNrczogVGFza3MudGFibGUucXVlcnkoKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gV2F0Y2ggZm9yIGNoYW5nZXMgdG8gVGFza3NcbiAgICBUYXNrcy5jb2xsZWN0aW9uLm9uKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIC8vIFVucmVnaXN0ZXIgZnJvbSBhcHAgZGlzcGF0Y2hlclxuICAgIGRpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLnRva2VuKTtcbiAgICAvLyBVbndhdGNoIGZvciBjaGFuZ2VzIHRvIFRhc2tzXG4gICAgVGFza3MuY29sbGVjdGlvbi5vbignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UuYmluZCh0aGlzKSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgbGV0IHRhc2tzID0gdGhpcy5zdGF0ZS50YXNrcztcblxuICAgIGxldCBoYXNodGFncyA9IHRoaXMuc3RhdGUubG9hZGVkID8gVGFza3MuY29sbGVjdGlvbi5nZXRIYXNodGFncygpIDogW107XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWdlXCI+XG4gICAgICAgIDxoNCBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPiBUYXNrcyA8L2g0PlxuICAgICAgICA8SGFzaHRhZ3MgaGFzaHRhZ3M9e2hhc2h0YWdzfS8+XG4gICAgICAgIDxUYXNrRm9ybSAvPlxuICAgICAgICB7dGhpcy5zdGF0ZS5sb2FkZWQgPyA8VGFza0xpc3QgdGFza3M9e3Rhc2tzfS8+IDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLXNwaW5uZXIgZmEtc3BpbiBmYS0yeFwiPjwvaT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFRhc2tQYWdlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSAnZXZlbnRzJztcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4uL2FwcC9kaXNwYXRjaGVyLmpzJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vYXBwL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuXG4vKipcbiAqIFJlZmVyZW5jZSB0byB0aGlzIGZpbGUncyBtb2R1bGVcbiAqIEB0eXBlIHt7fX1cbiAqL1xubGV0IFRhc2tzID0ge307XG5cbi8qKlxuICogV2hldGhlciBzdG9yZSBoYXMgYmVlbiBsb2FkZWRcbiAqIEB0eXBlIHtib29sZWFufVxuICogQHByaXZhdGVcbiAqL1xuVGFza3MuaXNMb2FkZWQgPSBmYWxzZTtcblxuLyoqXG4gKiBDdXJyZW50bHkgbG9nZ2VkIGluIHVzZXIgaWYgY3VycmVudCB1c2VyXG4gKiBAdHlwZSB7b2JqZWN0fVxuICovXG5UYXNrcy5jdXJyZW50VXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuXG5jb25zdCBUYXNrQ29uc3RhbnRzID0gY29uc3RhbnRzLlRBU0tTO1xuY29uc3QgQ0hBTkdFX0VWRU5UID0gJ2NoYW5nZSc7XG5cbi8qKlxuICogTW9kZWwgZm9yIHRhc2tzXG4gKi9cbmNvbnN0IFRhc2sgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdUYXNrT2JqZWN0Jywge1xuXG4gIGdldEhhc2h0YWdzKCkge1xuICAgIHJldHVybiB0aGlzLmdldCgnaGFzaHRhZ3MnKSB8fCBbXTtcbiAgfVxuXG59KTtcblxuLyoqXG4gKiBDb2xsZWN0aW9uIGZvciB0YXNrc3NcbiAqIEB0eXBlIHtTZWxlY3Rpb24uZXh0ZW5kfVxuICovXG5sZXQgVGFza0NvbGxlY3Rpb24gPSBQYXJzZS5Db2xsZWN0aW9uLmV4dGVuZChfLm1lcmdlKHtcblxuICAvLyBTZXQgbW9kZWwgb2YgY29sbGVjdGlvblxuICBtb2RlbDogVGFzayxcblxuICAvKipcbiAgICogVHJ1ZSBpZiBzdG9yZSBoYXMgYmVlbiBsb2FkZWQsIGZhbHNlIGlmIGl0IGhhcyBub3RcbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqL1xuICBpc0xvYWRlZDogZmFsc2UsXG5cbiAgbG9hZCgpIHtcbiAgICBsZXQgcXVlcnkgPSBuZXcgUGFyc2UuUXVlcnkodGhpcy5tb2RlbCk7XG4gICAgcXVlcnkuZXF1YWxUbyhcInVzZXJcIiwgUGFyc2UuVXNlci5jdXJyZW50KCkuaWQpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICByZXR1cm4gcXVlcnkuZmluZCh7XG4gICAgICAgIHN1Y2Nlc3M6ICh0YXNrcykgPT4ge1xuICAgICAgICAgIFRhc2tzLmNvbGxlY3Rpb24uYWRkKHRhc2tzKTtcbiAgICAgICAgICBUYXNrcy5pc0xvYWRlZCA9IHRydWU7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUodGFza3MpO1xuICAgICAgICB9LFxuICAgICAgICBlcnJvcjogKC4uLmFyZ3MpID0+IHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHRhc2tcbiAgICogQHBhcmFtICB7c3RyaW5nfSB0YXNrXG4gICAqL1xuICBhZGRUYXNrKHRhc2spIHtcbiAgICB0YXNrLmNvbXBsZXRlID0gZmFsc2U7XG5cbiAgICAvLyBHZXQgaGFzaHRhZ3MgZnJvbSBkZXNjcmlwdGlvblxuICAgIHRhc2suaGFzaHRhZ3MgPSBUYXNrcy5jb2xsZWN0aW9uLnBhcnNlSGFzaHRhZ3ModGFzay5kZXNjcmlwdGlvbik7XG5cbiAgICAvLyBTZXQgY3VycmVudCB1c2VyJ3MgaWQgdG8gdGFza1xuICAgIHRhc2sudXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpLmlkO1xuXG4gICAgLy8gUE9TVCB0YXNrIHRvIFBhcnNlIEFQSVxuICAgIHRoaXMuY3JlYXRlKHRhc2ssIHtcbiAgICAgIHN1Y2Nlc3MocmVzcG9uc2UpIHtcbiAgICAgICAgcmVzcG9uc2UuY29sbGVjdGlvbi5lbWl0Q2hhbmdlKCk7XG4gICAgICB9LFxuICAgICAgZXJyb3IoKSB7XG4gICAgICAgIGRlYnVnZ2VyO1xuICAgICAgfVxuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBVcGRhdGUgYSBUT0RPIGl0ZW0uXG4gICAqIEBwYXJhbSAge3N0cmluZ30gaWRcbiAgICogQHBhcmFtIHtvYmplY3R9IHVwZGF0ZXMgQW4gb2JqZWN0IGxpdGVyYWwgY29udGFpbmluZyBvbmx5IHRoZSBkYXRhIHRvIGJlXG4gICAqICAgICB1cGRhdGVkLlxuICAgKi9cbiAgdXBkYXRlKGlkLCB1cGRhdGVzKSB7XG4gICAgdmFyIHRhc2sgPSB0aGlzLnRhYmxlLnF1ZXJ5KHsgaWQ6IGlkIH0pWzBdO1xuICAgIGlmICh0YXNrKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModXBkYXRlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIHJldHVybiB0YXNrLnNldChrZXksIHVwZGF0ZXNba2V5XSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihgVGFzayAke2lkfSBjb3VsZCBub3QgYmUgZm91bmRgKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBhbGwgb2YgdGhlIFRPRE8gaXRlbXMgd2l0aCB0aGUgc2FtZSBvYmplY3QuXG4gICAqICAgICB0aGUgZGF0YSB0byBiZSB1cGRhdGVkLiAgVXNlZCB0byBtYXJrIGFsbCBUT0RPcyBhcyBjb21wbGV0ZWQuXG4gICAqIEBwYXJhbSAge29iamVjdH0gdXBkYXRlcyBBbiBvYmplY3QgbGl0ZXJhbCBjb250YWluaW5nIG9ubHkgdGhlIGRhdGEgdG8gYmVcbiAgICogICAgIHVwZGF0ZWQuXG4gICAqL1xuICB1cGRhdGVBbGwodXBkYXRlcykge1xuICAgIGxldCB0YXNrcyA9IHRoaXMudGFibGUucXVlcnkoKTtcbiAgICByZXR1cm4gdGFza3MuZm9yRWFjaChmdW5jdGlvbih0YXNrKSB7XG4gICAgICBUYXNrQ29sbGVjdGlvbi51cGRhdGUodGFzay5nZXQoJ2lkJyksIHVwZGF0ZXMpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBEZWxldGUgYSBUT0RPIGl0ZW0uXG4gICAqIEBwYXJhbSAge3N0cmluZ30gaWRcbiAgICovXG4gIGRlc3Ryb3koaWQpIHtcbiAgICBkZWxldGUgX3Rhc2tzW2lkXTtcbiAgfSxcblxuICAvKipcbiAgICogRGVsZXRlIGFsbCB0aGUgY29tcGxldGVkIFRPRE8gaXRlbXMuXG4gICAqL1xuICBkZXN0cm95Q29tcGxldGVkKCkge1xuICAgIGZvciAodmFyIGlkIGluIF90YXNrcykge1xuICAgICAgaWYgKF90YXNrc1tpZF0uY29tcGxldGUpIHtcbiAgICAgICAgZGVzdHJveShpZCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBUZXN0cyB3aGV0aGVyIGFsbCB0aGUgcmVtYWluaW5nIFRPRE8gaXRlbXMgYXJlIG1hcmtlZCBhcyBjb21wbGV0ZWQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBhcmVBbGxDb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaWQgaW4gX3Rhc2tzKSB7XG4gICAgICBpZiAoIV90YXNrc1tpZF0uY29tcGxldGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0IHRoZSBlbnRpcmUgY29sbGVjdGlvbiBvZiBUT0RPcy5cbiAgICogQHJldHVybiB7b2JqZWN0fVxuICAgKi9cbiAgZ2V0QWxsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZS5xdWVyeSgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2V0IHN0b3JlJ3MgcmVjb3JkcyBmaWx0ZXJlZCBvbiBwcm9wZXJ0eSBieSB2YWx1ZVxuICAgKiBAcGFyYW0gIHsqfSBwcm9wZXJ0eSBQcm9wZXJ0eSB0byBmaWx0ZXIgcmVjb3JkcyBvblxuICAgKiBAcGFyYW0gIHsqfSB2YWx1ZSAgICBWYWx1ZSB0byBmaWx0ZXIgZm9yXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgZ2V0QnkocHJvcGVydHksIHZhbHVlLCBub3QpIHtcbiAgICBsZXQgdGFza3MgPSB0aGlzLnRhYmxlLnF1ZXJ5KCk7XG4gICAgaWYgKG5vdClcbiAgICAgIHJldHVybiB0YXNrcy5maWx0ZXIocmVjb3JkID0+IHJlY29yZFtwcm9wZXJ0eV0gIT09IHZhbHVlKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gdGFza3MuZmlsdGVyKHJlY29yZCA9PiByZWNvcmRbcHJvcGVydHldID09PSB2YWx1ZSk7XG4gIH0sXG5cbiAgZ2V0QnlIYXNodGFnKGhhc2h0YWcpIHtcbiAgICByZXR1cm4gVGFza3MuY29sbGVjdGlvbi5tb2RlbHMuZmlsdGVyKGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgIGxldCB0YWdzID0gdGFzay5nZXQoJ2hhc2h0YWdzJyk7XG4gICAgICByZXR1cm4gdGFncy5sZW5ndGgoKSAmJiB+dGFncy50b0FycmF5KCkuaW5kZXhPZihoYXNodGFnKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEdldCBoYXNodGFncyBmcm9tIHN0b3JlJ3MgcmVjb3Jkc1xuICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAqL1xuICBnZXRIYXNodGFncygpIHtcbiAgICByZXR1cm4gVGFza3MuY29sbGVjdGlvbi5tb2RlbHNcbiAgICAgIC5maWx0ZXIoKHRhc2spPT4ge1xuICAgICAgICByZXR1cm4gdGFzay5nZXRIYXNodGFncygpLmxlbmd0aDtcbiAgICAgIH0pXG4gICAgICAubWFwKCh0YXNrKSA9PiB0YXNrLmdldCgnaGFzaHRhZ3MnKSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHZXQgYXJyYXkgb2YgaGFzaHRhZ3MgZnJvbSB0ZXh0XG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGV4dCBUZXh0IHRvIHNlYXJjaCBmb3IgaGFzaHRhZ3NcbiAgICogQHJldHVybiB7QXJyYXl9ICAgICAgTGlzdCBvZiBoYXNodGFnc1xuICAgKi9cbiAgcGFyc2VIYXNodGFncyh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQubWF0Y2goLygjW2EtelxcZF1bXFx3LV0qKS9pZykgfHwgW107XG4gIH0sXG5cbiAgZW1pdENoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy50cmlnZ2VyKENIQU5HRV9FVkVOVCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqL1xuICBhZGRDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB0aGlzLm9uKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgKi9cbiAgcmVtb3ZlQ2hhbmdlTGlzdGVuZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihDSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxuXG59KSk7XG5cbi8vIFJlZ2lzdGVyIGNhbGxiYWNrIHRvIGhhbmRsZSBhbGwgdXBkYXRlc1xuZGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihhY3Rpb24pIHtcbiAgbGV0IHRleHQ7XG4gIGxldCBjb2xsZWN0aW9uID0gVGFza3MuY29sbGVjdGlvbjtcblxuICBzd2l0Y2goYWN0aW9uLmFjdGlvblR5cGUpIHtcbiAgICBjYXNlIFRhc2tDb25zdGFudHMuQ1JFQVRFOlxuICAgICAgaWYgKGFjdGlvbi5kYXRhLmRlc2NyaXB0aW9uICE9PSAnJykge1xuICAgICAgICBjb2xsZWN0aW9uLmFkZFRhc2soYWN0aW9uLmRhdGEpO1xuICAgICAgICBjb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLlRPR0dMRV9DT01QTEVURV9BTEw6XG4gICAgICBpZiAoVGFza3MuYXJlQWxsQ29tcGxldGUoKSkge1xuICAgICAgICBjb2xsZWN0aW9uLnVwZGF0ZUFsbCh7Y29tcGxldGU6IGZhbHNlfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb2xsZWN0aW9uLnVwZGF0ZUFsbCh7Y29tcGxldGU6IHRydWV9KTtcbiAgICAgIH1cbiAgICAgIGNvbGxlY3Rpb24uZW1pdENoYW5nZSgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuVU5ET19DT01QTEVURTpcbiAgICAgIGNvbGxlY3Rpb24udXBkYXRlKGFjdGlvbi5pZCwge2NvbXBsZXRlOiBmYWxzZX0pO1xuICAgICAgY29sbGVjdGlvbi5lbWl0Q2hhbmdlKCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgVGFza0NvbnN0YW50cy5DT01QTEVURTpcbiAgICAgIGNvbGxlY3Rpb24udXBkYXRlKGFjdGlvbi5pZCwge2NvbXBsZXRlOiB0cnVlfSk7XG4gICAgICBjb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLlVQREFURTpcbiAgICAgIHRleHQgPSBhY3Rpb24udGV4dC50cmltKCk7XG4gICAgICBpZiAodGV4dCAhPT0gJycpIHtcbiAgICAgICAgY29sbGVjdGlvbi51cGRhdGUoYWN0aW9uLmlkLCB7dGV4dDogdGV4dH0pO1xuICAgICAgICBjb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLkRFU1RST1k6XG4gICAgICBhY3Rpb24uZGF0YS5kZXN0cm95KHtcbiAgICAgICAgc3VjY2VzcyhvYmplY3QpIHtcbiAgICAgICAgICBjb2xsZWN0aW9uLmVtaXRDaGFuZ2UoKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3Iob2JqZWN0LCBlcnIpIHtcbiAgICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgLy8gbm8gb3BcbiAgfVxuXG59KTtcblxuVGFza3MubW9kZWwgPSBUYXNrO1xuXG5UYXNrcy5jb2xsZWN0aW9uID0gbmV3IFRhc2tDb2xsZWN0aW9uKCk7XG5cbmV4cG9ydCBkZWZhdWx0IFRhc2tzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi9hcHAvY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG5cbiAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIHRoaXMuZGlzcGF0Y2hUb2tlbiA9IGRpc3BhdGNoZXIucmVnaXN0ZXIoKHBheWxvYWQpID0+IHtcbiAgICAgIHN3aXRjaChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAgICAgICAgY2FzZSBjb25zdGFudHMuVEFTS1MuRURJVDpcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHZhbHVlOiBwYXlsb2FkLmRhdGEuZ2V0KCdkZXNjcmlwdGlvbicpXG4gICAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIC8vIFVucmVnaXN0ZXIgZnJvbSBhcHAgZGlzcGF0Y2hlclxuICAgIGRpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLmRpc3BhdGNoVG9rZW4pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGUgZm9ybSBzdWJtaXNzaW9uXG4gICAqIEBwYXJhbSB7U3ludGhldGljRXZlbnR9IGV2ZW50XG4gICAqL1xuICBvblN1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBFbXB0eSBpbnB1dCB2YWx1ZVxuICAgIHRoaXMuc2V0U3RhdGUoeyB2YWx1ZTogJycgfSk7XG5cbiAgICAvLyBEaXNwYXRjaCB0YXNrIGNyZWF0aW9uIGV2ZW50XG4gICAgZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBjb25zdGFudHMuVEFTS1MuQ1JFQVRFLFxuICAgICAgZGF0YToge1xuICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5yZWZzLm5hbWUuZ2V0RE9NTm9kZSgpLnZhbHVlXG4gICAgICB9XG4gICAgfSlcbiAgfSxcblxuICAvKipcbiAgICogU2V0IHZhbHVlIG9mIGlucHV0IGZpZWxkIHRvIHN0YXRlLnZhbHVlIG9uIGNoYW5nZVxuICAgKi9cbiAgb25DaGFuZ2UoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiB0aGlzLnJlZnMubmFtZS5nZXRET01Ob2RlKCkudmFsdWUgfSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJjYXJkXCI+XG4gICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cInRhc2stZm9ybVwiIG9uU3VibWl0PXt0aGlzLm9uU3VibWl0fT5cbiAgICAgICAgICA8aW5wdXQgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9XG4gICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VhcmNoIHRhc2tzIG9yIGNyZWF0ZSBuZXcgdGFza1wiXG4gICAgICAgICAgICAgICAgIHJlZj1cIm5hbWVcIlxuICAgICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfS8+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICApO1xuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXIuanMnO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi9hcHAvY29uc3RhbnRzLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIG9uRWRpdENsaWNrKHRhc2spIHtcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IGNvbnN0YW50cy5UQVNLUy5FRElULFxuICAgICAgZGF0YTogdGFza1xuICAgIH0pXG4gIH0sXG5cbiAgLyoqXG4gICAqIERlbGV0ZSB0YXNrXG4gICAqIEBwYXJhbSB7Y2hpbGR9IHRhc2tcbiAgICovXG4gIG9uRGVsZXRlQ2xpY2sodGFzaykge1xuICAgIGRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogY29uc3RhbnRzLlRBU0tTLkRFU1RST1ksXG4gICAgICBkYXRhOiB0YXNrXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCB0YXNrcyA9IHRoaXMucHJvcHMudGFza3MgfHwgW107XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cInRhc2stbGlzdFwiPlxuICAgICAgICB7dGFza3MubWFwKCh0YXNrKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxsaSBrZXk9e3Rhc2suZ2V0KFwib2JqZWN0SWRcIil9IGNsYXNzTmFtZT1cInRhc2stbGlzdC1pdGVtIGNhcmRcIj5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPXt0YXNrLmNvbXBsZXRlZH0gLz5cbiAgICAgICAgICAgICAgPHNwYW4+e3Rhc2suZ2V0KCdkZXNjcmlwdGlvbicpfTwvc3Bhbj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdWxsLXJpZ2h0XCI+XG4gICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtZWRpdFwiIG9uQ2xpY2s9e3RoaXMub25FZGl0Q2xpY2suYmluZCh0aGlzLCB0YXNrKX0+PC9pPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLWNsb3NlXCIgb25DbGljaz17dGhpcy5vbkRlbGV0ZUNsaWNrLmJpbmQodGhpcywgdGFzayl9PjwvaT5cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICk7XG4gICAgICAgIH0pfVxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG5cbn0pO1xuIl19
