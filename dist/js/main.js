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

},{"./app":7,"react":"react","react-router":"react-router"}],2:[function(require,module,exports){
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

},{"react":"react"}],3:[function(require,module,exports){
"use strict";

var React = require("react");

module.exports = React.createClass({
  displayName: "exports",

  render: function render() {
    return React.createElement("ul", null);
  }

});

},{"react":"react"}],4:[function(require,module,exports){
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

},{"./activity-form":2,"./activity-list":3,"react":"react"}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
"use strict";

var Dispatcher = require("flux").Dispatcher;

module.exports = new Dispatcher();

},{"flux":"flux"}],7:[function(require,module,exports){
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

},{"./constants":5,"./dispatcher":6,"./routes":8}],8:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// Components

var App = _interopRequire(require("../pages/app"));

var Home = _interopRequire(require("../pages/home"));

var NotFound = _interopRequire(require("../pages/not-found"));

var TaskPage = _interopRequire(require("../tasks"));

var ActivityPage = _interopRequire(require("../activity"));

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
  React.createElement(Route, { path: "tasks", handler: TaskPage }),
  React.createElement(Route, { path: "activity", handler: ActivityPage })
);

module.exports = routes;

},{"../activity":4,"../pages/app":9,"../pages/home":10,"../pages/not-found":11,"../tasks":14,"react":"react","react-router":"react-router"}],9:[function(require,module,exports){
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

},{"../app/dispatcher":6,"react":"react","react-router":"react-router"}],10:[function(require,module,exports){
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

},{"./sign-up.js":12,"react":"react"}],11:[function(require,module,exports){
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

},{"react":"react"}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var SignUp = React.createClass({
  displayName: "SignUp",

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement("input", { type: "email", placeholder: " Email Address" }),
      React.createElement(
        "button",
        null,
        " Sign Up "
      )
    );
  }

});

module.exports = SignUp;

},{"react":"react"}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

var dispatcher = _interopRequire(require("../app/dispatcher"));

module.exports = React.createClass({
  displayName: "hashtags",

  getInitialState: function getInitialState() {
    for (var _len = arguments.length, props = Array(_len), _key = 0; _key < _len; _key++) {
      props[_key] = arguments[_key];
    }

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

},{"../app/dispatcher":6,"react":"react"}],14:[function(require,module,exports){
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
      tasks: Tasks._isLoaded ? Tasks.tasks : []
    };
  }

  _inherits(TaskPage, _React$Component);

  _createClass(TaskPage, {
    _onChange: {
      value: function _onChange() {
        this.setState({ tasks: TaskStore.getAll() });
      }
    },
    componentWillMount: {
      value: function componentWillMount() {
        Tasks.collection.fetch({
          success: function success() {
            debugger;
          }
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
        var tasks = this.state.tasks.map(function (task) {
          return task.getFields();
        });

        var hashtags = Tasks._isLoaded ? Tasks.getHashtags() : [];

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

},{"../app/dispatcher":6,"./hashtags":13,"./store":15,"./task-form":16,"./task-list":17,"react":"react"}],15:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var dispatcher = _interopRequire(require("../app/dispatcher.js"));

var constants = _interopRequire(require("../app/constants.js"));

var _ = _interopRequire(require("lodash"));

/**
 * Whether store has been loaded
 * @type {boolean}
 * @private
 */
var _isLoaded = false;

var TaskConstants = constants.TASKS;
var CHANGE_EVENT = "change";

var Task = Parse.Object.extend("TaskObject", {});

var TaskCollection = new Parse.Collection({
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
  create: function create(task) {
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
    var tasks = this.table.query();

    return tasks.filter(function (task) {
      var tags = task.get("hashtags");
      return tags.length() && ~tags.toArray().indexOf(hashtag);
    });
  },

  /**
   * @description Get hashtags from store's records
   * @returns {Array}
   */
  getHashtags: function getHashtags() {
    var hashtags = [];
    var tasks = this.table.query();

    tasks.forEach(function (task) {
      var taskTags = task.get("hashtags");
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
});

/**
 * Currently logged in user if current user
 * @type {object}
 */
var currentUser = Parse.User.current();

// Check user authentication
if (currentUser) {
  console.log(currentUser);
} else {
  Parse.User.logIn(username, {
    success: function (user) {
      undefined.undelegateEvents();
    },
    error: function (user, error) {
      undefined.$(".login-form .error").html("Invalid username or password. Please try again.").show();
      undefined.$(".login-form button").removeAttr("disabled");
    }
  });
}

// Register callback to handle all updates
dispatcher.register(function (action) {
  var text = undefined;

  switch (action.actionType) {
    case TaskConstants.CREATE:
      if (action.data.description !== "") {
        Tasks.create(action.data);
        Tasks.emitChange();
      }
      break;

    case TaskConstants.TOGGLE_COMPLETE_ALL:
      if (Tasks.areAllComplete()) {
        Tasks.updateAll({ complete: false });
      } else {
        Tasks.updateAll({ complete: true });
      }
      Tasks.emitChange();
      break;

    case TaskConstants.UNDO_COMPLETE:
      Tasks.update(action.id, { complete: false });
      Tasks.emitChange();
      break;

    case TaskConstants.COMPLETE:
      Tasks.update(action.id, { complete: true });
      Tasks.emitChange();
      break;

    case TaskConstants.UPDATE:
      text = action.text.trim();
      if (text !== "") {
        Tasks.update(action.id, { text: text });
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

module.exports = {
  _isLoaded: _isLoaded,
  model: Task,
  collection: TaskCollection
};

},{"../app/constants.js":5,"../app/dispatcher.js":6,"lodash":"lodash"}],16:[function(require,module,exports){
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

},{"../app/constants":5,"../app/dispatcher":6,"react":"react"}],17:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var React = _interopRequire(require("react"));

module.exports = React.createClass({
  displayName: "task-list",

  onEditClick: function onEditClick() {},

  onDeleteClick: function onDeleteClick() {},

  render: function render() {
    var _this = this;

    return React.createElement(
      "ul",
      { className: "task-list" },
      this.props.tasks.map(function (task) {
        return React.createElement(
          "li",
          { key: task.id, className: "task-list-item card" },
          React.createElement("input", { type: "checkbox", value: task.completed }),
          React.createElement(
            "span",
            null,
            task.description
          ),
          React.createElement(
            "div",
            { className: "pull-right" },
            React.createElement("i", { className: "fa fa-edit", onClick: _this.onEditClick }),
            React.createElement("i", { className: "fa fa-close", onClick: _this.onDeleteClick })
          )
        );
      })
    );
  }

});

},{"react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL21haW4uanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FjdGl2aXR5L2FjdGl2aXR5LWZvcm0uanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FjdGl2aXR5L2FjdGl2aXR5LWxpc3QuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FjdGl2aXR5L2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvY29uc3RhbnRzLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvZGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYXBwL2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvcm91dGVzLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9hcHAuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3BhZ2VzL2hvbWUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3BhZ2VzL25vdC1mb3VuZC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvcGFnZXMvc2lnbi11cC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvdGFza3MvaGFzaHRhZ3MuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3Rhc2tzL2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy9zdG9yZS5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvdGFza3MvdGFzay1mb3JtLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy90YXNrLWxpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7QUFFYixNQUFNLENBQUMsS0FBSyxDQUNULFVBQVUsQ0FDVCwwQ0FBMEMsRUFDMUMsMENBQTBDLENBQzNDLENBQUM7O0lBRUcsS0FBSywyQkFBTSxPQUFPOztJQUNsQixNQUFNLDJCQUFNLGNBQWM7O0lBQzFCLEdBQUcsMkJBQU0sT0FBTzs7O0FBR3ZCLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsT0FBTyxFQUFFO0FBQ3hDLE9BQUssQ0FBQyxNQUFNLENBQUMsb0JBQUMsT0FBTyxPQUFFLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0NBQzFELENBQUMsQ0FBQzs7O0FDakJILFlBQVksQ0FBQzs7QUFFYixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRWpDLFVBQVEsRUFBQSxrQkFBQyxLQUFLLEVBQUU7QUFDZCxTQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7R0FFeEI7O0FBRUQsUUFBTSxFQUFBLGtC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TSxPQUFPOztpQkFFVixLQUFLLENBQUMsV0FBVyxDQUFDOzs7QUFFL0IsYUFBVyxFQUFBLHVCQUFHLEVBRWI7O0FBRUQsZUFBYSxFQUFBLHlCQUFHLEVBRWY7O0FBRUQsUUFBTSxFQUFBLGtCQUFHOzs7QUFDUCxXQUNFOztRQUFJLFNBQVMsRUFBQyxXQUFXO01BQ3RCLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFDLElBQUksRUFBSztBQUM5QixlQUNFOztZQUFJLEdBQUcsRUFBRSxJQUFJLENBQUMsRUFBRSxBQUFDLEVBQUMsU0FBUyxFQUFDLHFCQUFxQjtVQUMvQywrQkFBTyxJQUFJLEVBQUMsVUFBVSxFQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsU0FBUyxBQUFDLEdBQUc7VUFDaEQ7OztZQUFPLElBQUksQ0FBQyxXQUFXO1dBQVE7VUFDL0I7O2NBQUssU0FBUyxFQUFDLFlBQVk7WUFDekIsMkJBQUcsU0FBUyxFQUFDLFlBQVksRUFBQyxPQUFPLEVBQUUsTUFBSyxXQUFXLEFBQUMsR0FBSztZQUN6RCwyQkFBRyxTQUFTLEVBQUMsYUFBYSxFQUFDLE9BQU8sRUFBRSxNQUFLLGFBQWEsQUFBQyxHQUFLO1dBQ3hEO1NBQ0gsQ0FDTDtPQUNILENBQUM7S0FDQyxDQUNMO0dBQ0g7O0NBRUYsQ0FBQyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbndpbmRvdy5QYXJzZVxuICAuaW5pdGlhbGl6ZShcbiAgICBcIkQxeVV0aEhjUk52VHlhbXllMndSenFBYnpTMmdCNW9YTzE5ZVhlOExcIixcbiAgICBcIjBvZWFKU2dzY3ByaDlTSEdEWkdpZndReHFOcm5uNENEZ3dPbURzc01cIlxuICApO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJvdXRlciBmcm9tICdyZWFjdC1yb3V0ZXInO1xuaW1wb3J0IEFwcCBmcm9tICcuL2FwcCc7XG5cbi8vIEluaXRpYWxpemUgVG91Y2hFdmVudHNcblJlYWN0LmluaXRpYWxpemVUb3VjaEV2ZW50cyh0cnVlKTtcblxuUm91dGVyLnJ1bihBcHAucm91dGVzLCBmdW5jdGlvbiAoSGFuZGxlcikge1xuICBSZWFjdC5yZW5kZXIoPEhhbmRsZXIvPiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FwcCcpKTtcbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGZvcm0gb25TdWJtaXQ9e3RoaXMub25TdWJtaXR9PlxuICAgICAgICA8aW5wdXQgdHlwZT1cInRleHRcIiBuYW1lPVwiYWN0aXZpdHkubmFtZVwiIHJlZj1cIm5hbWVcIiAvPlxuICAgICAgICA8YnV0dG9uPiBTdGFydCBUcmFja2luZyA8L2J1dHRvbj5cbiAgICAgIDwvZm9ybT5cbiAgICApXG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8dWw+XG4gICAgICA8L3VsPlxuICAgIClcbiAgfVxuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuY29uc3QgQWN0aXZpdHlGb3JtID0gcmVxdWlyZSgnLi9hY3Rpdml0eS1mb3JtJyk7XG5jb25zdCBBY3Rpdml0eUxpc3QgPSByZXF1aXJlKCcuL2FjdGl2aXR5LWxpc3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aDMgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj4gQWN0aXZpdHkgPC9oMz5cbiAgICAgICAgPEFjdGl2aXR5Rm9ybSAvPlxuICAgICAgICA8QWN0aXZpdHlMaXN0IC8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxufSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIFRBU0tTOiB7XG4gICAgQ09NUExFVEU6ICd0YXNrOmNvbXBsZXRlJyxcbiAgICBDUkVBVEU6ICd0YXNrOmNyZWF0ZScsXG4gICAgREVTVFJPWTogJ3Rhc2s6ZGVzdHJveScsXG4gICAgVU5ET19DT01QTEVURTogJ3Rhc2s6dW5kby1jb21wbGV0ZScsXG4gICAgVVBEQVRFOiAndGFzazp1cGRhdGUnLFxuICAgIFRPR0dMRV9DT01QTEVURV9BTEw6ICd0YXNrczpjb21wbGV0ZS1hbGwnXG4gIH0sXG5cbiAgVVNFUjoge1xuICAgIEFVVEhFTlRJQ0FURUQ6ICd1c2VyOmF1dGhlbnRpY2F0ZWQnLFxuICAgIFVOQVVUSEVOVElDQVRFRDogJ3VzZXI6dW5hdXRoZW50aWNhdGVkJ1xuICB9LFxuXG4gIEZJUkVCQVNFOiB7XG4gICAgQURERUQ6ICdjaGlsZF9hZGRlZCdcbiAgfVxuXG59XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRGlzcGF0Y2hlcigpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuL2Rpc3BhdGNoZXInO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgcm91dGVzIGZyb20gJy4vcm91dGVzJztcblxuZXhwb3J0IGRlZmF1bHQge1xuXG4gIGRpc3BhdGNoZXI6IGRpc3BhdGNoZXIsXG5cbiAgY29uc3RhbnRzOiBjb25zdGFudHMsXG5cbiAgcm91dGVzOiByb3V0ZXNcblxufTtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IEFwcCBmcm9tICcuLi9wYWdlcy9hcHAnO1xuaW1wb3J0IEhvbWUgZnJvbSAnLi4vcGFnZXMvaG9tZSc7XG5pbXBvcnQgTm90Rm91bmQgZnJvbSAnLi4vcGFnZXMvbm90LWZvdW5kJztcbmltcG9ydCBUYXNrUGFnZSBmcm9tICcuLi90YXNrcyc7XG5pbXBvcnQgQWN0aXZpdHlQYWdlIGZyb20gJy4uL2FjdGl2aXR5JztcblxuLy8gRGVwZW5kZW5jaWVzXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJvdXRlciBmcm9tICdyZWFjdC1yb3V0ZXInO1xuXG5sZXQgUm91dGUgID0gUm91dGVyLlJvdXRlO1xubGV0IERlZmF1bHRSb3V0ZSA9IFJvdXRlci5EZWZhdWx0Um91dGU7XG5sZXQgTm90Rm91bmRSb3V0ZSA9IFJvdXRlci5Ob3RGb3VuZFJvdXRlO1xuXG52YXIgcm91dGVzID0gKFxuICA8Um91dGUgcGF0aD1cIi9cIiBoYW5kbGVyPXtBcHB9PlxuICAgIDxEZWZhdWx0Um91dGUgaGFuZGxlcj17SG9tZX0gLz5cbiAgICA8Tm90Rm91bmRSb3V0ZSBoYW5kbGVyPXtOb3RGb3VuZH0vPlxuICAgIDxSb3V0ZSBwYXRoPVwidGFza3NcIiBoYW5kbGVyPXtUYXNrUGFnZX0gLz5cbiAgICA8Um91dGUgcGF0aD1cImFjdGl2aXR5XCIgaGFuZGxlcj17QWN0aXZpdHlQYWdlfSAvPlxuICA8L1JvdXRlPlxuKTtcblxuZXhwb3J0IGRlZmF1bHQgcm91dGVzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtSb3V0ZUhhbmRsZXJ9IGZyb20gJ3JlYWN0LXJvdXRlcic7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlcic7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIHsvKiB0aGlzIGlzIHRoZSBpbXBvcnRhbnQgcGFydCAqL31cbiAgICAgICAgPFJvdXRlSGFuZGxlci8+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgU2lnblVwIGZyb20gJy4vc2lnbi11cC5qcyc7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIGF1dGhlbnRpY2F0ZWQ6IFBhcnNlLlVzZXIuY3VycmVudCgpXG4gICAgfVxuICB9LFxuXG4gIGNvbm5lY3REcm9wYm94KCkge1xuICAgIGlmICghdGhpcy5zdGF0ZS5hdXRoZW50aWNhdGVkKSB7XG5cbiAgICB9XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBtYXJrdXA7XG5cbiAgICBpZiAoIXRoaXMuc3RhdGUuYXV0aGVudGljYXRlZCkge1xuICAgICAgbWFya3VwID0gPFNpZ25VcC8+O1xuICAgIH0gZWxzZSB7XG4gICAgICBtYXJrdXAgPSAoXG4gICAgICAgIDxidXR0b24+XG4gICAgICAgICAgPGEgaHJlZj1cIiMvdGFza3NcIj5UYXNrczwvYT5cbiAgICAgICAgPC9idXR0b24+XG4gICAgICApXG4gICAgfVxuXG4gICAgcmV0dXJuIChcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cInRleHQtY2VudGVyIGhvbWVcIj5cbiAgICAgICAge21hcmt1cH1cbiAgICAgIDwvc2VjdGlvbj5cbiAgICApXG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNsYXNzIE5vdEZvdW5kIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoMT4gV2hhdCBZb3UgVGFsa2luZyBBYm91dCwgV2lsbGlzPzwvaDE+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBOb3RGb3VuZDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY29uc3QgU2lnblVwID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJlbWFpbFwiIHBsYWNlaG9sZGVyPVwiIEVtYWlsIEFkZHJlc3NcIiAvPlxuICAgICAgICA8YnV0dG9uPiBTaWduIFVwIDwvYnV0dG9uPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59KTtcblxuZXhwb3J0IGRlZmF1bHQgU2lnblVwO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZ2V0SW5pdGlhbFN0YXRlKC4uLnByb3BzKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuXG4gIF9vbkNsaWNrKGhhc2h0YWcpIHtcbiAgICAvLyBDaGVjayBpZiBoYXNodGFnIGlzIHNhbWUgYXMgY3VycmVudGx5IHNlbGVjdGVkXG4gICAgbGV0IGlzU2VsZWN0ZWQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkID09PSBoYXNodGFnO1xuXG4gICAgLy8gU2V0IHNlbGVjdGVkIGhhc2h0YWcgdG8gc3RhdGVcbiAgICB0aGlzLnNldFN0YXRlKHsgc2VsZWN0ZWQ6IGhhc2h0YWcgfSk7XG5cbiAgICAvLyBEaXNwYXRjaCBzZWFyY2ggYnkgaGFzaHRhZ1xuICAgIGRpc3BhdGNoZXIuZGlzcGF0Y2goe1xuICAgICAgYWN0aW9uVHlwZTogJ3NlYXJjaDpoYXNodGFnJyxcbiAgICAgIGRhdGE6IGlzU2VsZWN0ZWQgPyB1bmRlZmluZWQgOiBoYXNodGFnXG4gICAgfSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwidGFzay1oYXNodGFncy1saXN0XCI+XG4gICAgICAgIHt0aGlzLnByb3BzLmhhc2h0YWdzLm1hcCgoaGFzaFRhZykgPT4ge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8bGkga2V5PXtoYXNoVGFnfVxuICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17e3NlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkID09PSBoYXNoVGFnIH19PlxuICAgICAgICAgICAgICA8YSBvbkNsaWNrPXt0aGlzLl9vbkNsaWNrLmJpbmQodGhpcywgaGFzaFRhZyl9PlxuICAgICAgICAgICAgICAgIHt7aGFzaFRhZ319XG4gICAgICAgICAgICAgIDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH1cblxufSk7XG5cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBUYXNrTGlzdCBmcm9tICcuL3Rhc2stbGlzdCc7XG5pbXBvcnQgVGFza3MgZnJvbSAnLi9zdG9yZSc7XG5pbXBvcnQgVGFza0Zvcm0gZnJvbSAnLi90YXNrLWZvcm0nO1xuaW1wb3J0IEhhc2h0YWdzIGZyb20gJy4vaGFzaHRhZ3MnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuXG5jbGFzcyBUYXNrUGFnZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgbG9hZGVkOiBUYXNrcy5faXNMb2FkZWQsXG4gICAgICB0YXNrczogIFRhc2tzLl9pc0xvYWRlZCA/IFRhc2tzLnRhc2tzIDogW11cbiAgICB9XG4gIH1cblxuICBfb25DaGFuZ2UoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHRhc2tzOiBUYXNrU3RvcmUuZ2V0QWxsKCkgfSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsTW91bnQoKSB7XG4gICAgVGFza3MuY29sbGVjdGlvbi5mZXRjaCh7XG4gICAgICBzdWNjZXNzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgZGVidWdnZXI7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBjb21wb25lbnREaWRNb3VudCgpIHtcbiAgICAvLyBSZWdpc3RlciB3aXRoIGFwcCBkaXNwYXRjaGVyXG4gICAgdGhpcy50b2tlbiA9IGRpc3BhdGNoZXIucmVnaXN0ZXIoKHBheWxvYWQpID0+IHtcbiAgICAgIHN3aXRjaCAocGF5bG9hZC5hY3Rpb25UeXBlKSB7XG4gICAgICAgIGNhc2UgJ3NlYXJjaDpoYXNodGFnJzpcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHRhc2tzOiBUYXNrcy5nZXRCeUhhc2h0YWcocGF5bG9hZC5kYXRhKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICd0YXNrczpsb2FkJzpcbiAgICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIGxvYWRlZDogdHJ1ZSxcbiAgICAgICAgICAgIHRhc2tzOiBUYXNrcy50YWJsZS5xdWVyeSgpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICAvLyBXYXRjaCBmb3IgY2hhbmdlcyB0byBUYXNrc1xuICAgIFRhc2tzLmNvbGxlY3Rpb24ub24oJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbFVubW91bnQoKSB7XG4gICAgLy8gVW5yZWdpc3RlciBmcm9tIGFwcCBkaXNwYXRjaGVyXG4gICAgZGlzcGF0Y2hlci51bnJlZ2lzdGVyKHRoaXMudG9rZW4pO1xuICAgIC8vIFVud2F0Y2ggZm9yIGNoYW5nZXMgdG8gVGFza3NcbiAgICBUYXNrcy5jb2xsZWN0aW9uLm9uKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgdGFza3MgPSB0aGlzLnN0YXRlLnRhc2tzLm1hcCgodGFzaykgPT4ge1xuICAgICAgcmV0dXJuIHRhc2suZ2V0RmllbGRzKCk7XG4gICAgfSk7XG5cbiAgICBsZXQgaGFzaHRhZ3MgPSBUYXNrcy5faXNMb2FkZWQgPyBUYXNrcy5nZXRIYXNodGFncygpIDogW107XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWdlXCI+XG4gICAgICAgIDxoNCBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPiBUYXNrcyA8L2g0PlxuICAgICAgICA8SGFzaHRhZ3MgaGFzaHRhZ3M9e2hhc2h0YWdzfS8+XG4gICAgICAgIDxUYXNrRm9ybSAvPlxuICAgICAgICB7dGhpcy5zdGF0ZS5sb2FkZWQgPyA8VGFza0xpc3QgdGFza3M9e3Rhc2tzfS8+IDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLXNwaW5uZXIgZmEtc3BpbiBmYS0yeFwiPjwvaT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFRhc2tQYWdlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uL2FwcC9jb25zdGFudHMuanMnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuLyoqXG4gKiBXaGV0aGVyIHN0b3JlIGhhcyBiZWVuIGxvYWRlZFxuICogQHR5cGUge2Jvb2xlYW59XG4gKiBAcHJpdmF0ZVxuICovXG5sZXQgX2lzTG9hZGVkID0gZmFsc2U7XG5cbmNvbnN0IFRhc2tDb25zdGFudHMgPSBjb25zdGFudHMuVEFTS1M7XG5jb25zdCBDSEFOR0VfRVZFTlQgPSAnY2hhbmdlJztcblxuY29uc3QgVGFzayA9IFBhcnNlLk9iamVjdC5leHRlbmQoJ1Rhc2tPYmplY3QnLCB7fSk7XG5cbmxldCBUYXNrQ29sbGVjdGlvbiA9IG5ldyBQYXJzZS5Db2xsZWN0aW9uKHtcbiAgLyoqXG4gICAqIFRydWUgaWYgc3RvcmUgaGFzIGJlZW4gbG9hZGVkLCBmYWxzZSBpZiBpdCBoYXMgbm90XG4gICAqIEB0eXBlIHtib29sZWFufVxuICAgKi9cbiAgaXNMb2FkZWQ6IGZhbHNlLFxuXG4gIHRhYmxlOiBudWxsLFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgdGFza1xuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHRhc2tcbiAgICovXG4gICAgY3JlYXRlKHRhc2spIHtcbiAgICB0YXNrLmlkID0gKCtuZXcgRGF0ZSgpICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogOTk5OTk5KSkudG9TdHJpbmcoMzYpO1xuICAgIHRhc2suY29tcGxldGUgPSBmYWxzZTtcbiAgICB0YXNrLmhhc2h0YWdzID0gVGFza0NvbGxlY3Rpb24ucGFyc2VIYXNodGFncyh0YXNrLmRlc2NyaXB0aW9uKTtcbiAgICB0aGlzLnRhYmxlLmluc2VydCh0YXNrKTtcbiAgfSxcblxuICAvKipcbiAgICogVXBkYXRlIGEgVE9ETyBpdGVtLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGlkXG4gICAqIEBwYXJhbSB7b2JqZWN0fSB1cGRhdGVzIEFuIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5pbmcgb25seSB0aGUgZGF0YSB0byBiZVxuICAgKiAgICAgdXBkYXRlZC5cbiAgICovXG4gICAgdXBkYXRlKGlkLCB1cGRhdGVzKSB7XG4gICAgdmFyIHRhc2sgPSB0aGlzLnRhYmxlLnF1ZXJ5KHsgaWQ6IGlkIH0pWzBdO1xuICAgIGlmICh0YXNrKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModXBkYXRlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIHJldHVybiB0YXNrLnNldChrZXksIHVwZGF0ZXNba2V5XSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihgVGFzayAke2lkfSBjb3VsZCBub3QgYmUgZm91bmRgKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBhbGwgb2YgdGhlIFRPRE8gaXRlbXMgd2l0aCB0aGUgc2FtZSBvYmplY3QuXG4gICAqICAgICB0aGUgZGF0YSB0byBiZSB1cGRhdGVkLiAgVXNlZCB0byBtYXJrIGFsbCBUT0RPcyBhcyBjb21wbGV0ZWQuXG4gICAqIEBwYXJhbSAge29iamVjdH0gdXBkYXRlcyBBbiBvYmplY3QgbGl0ZXJhbCBjb250YWluaW5nIG9ubHkgdGhlIGRhdGEgdG8gYmVcbiAgICogICAgIHVwZGF0ZWQuXG4gICAqL1xuICAgIHVwZGF0ZUFsbCh1cGRhdGVzKSB7XG4gICAgbGV0IHRhc2tzID0gdGhpcy50YWJsZS5xdWVyeSgpO1xuICAgIHJldHVybiB0YXNrcy5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgIFRhc2tDb2xsZWN0aW9uLnVwZGF0ZSh0YXNrLmdldCgnaWQnKSwgdXBkYXRlcyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhIFRPRE8gaXRlbS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBpZFxuICAgKi9cbiAgICBkZXN0cm95KGlkKSB7XG4gICAgZGVsZXRlIF90YXNrc1tpZF07XG4gIH0sXG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhbGwgdGhlIGNvbXBsZXRlZCBUT0RPIGl0ZW1zLlxuICAgKi9cbiAgICBkZXN0cm95Q29tcGxldGVkKCkge1xuICAgIGZvciAodmFyIGlkIGluIF90YXNrcykge1xuICAgICAgaWYgKF90YXNrc1tpZF0uY29tcGxldGUpIHtcbiAgICAgICAgZGVzdHJveShpZCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBUZXN0cyB3aGV0aGVyIGFsbCB0aGUgcmVtYWluaW5nIFRPRE8gaXRlbXMgYXJlIG1hcmtlZCBhcyBjb21wbGV0ZWQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBhcmVBbGxDb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaWQgaW4gX3Rhc2tzKSB7XG4gICAgICBpZiAoIV90YXNrc1tpZF0uY29tcGxldGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0IHRoZSBlbnRpcmUgY29sbGVjdGlvbiBvZiBUT0RPcy5cbiAgICogQHJldHVybiB7b2JqZWN0fVxuICAgKi9cbiAgZ2V0QWxsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZS5xdWVyeSgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2V0IHN0b3JlJ3MgcmVjb3JkcyBmaWx0ZXJlZCBvbiBwcm9wZXJ0eSBieSB2YWx1ZVxuICAgKiBAcGFyYW0gIHsqfSBwcm9wZXJ0eSBQcm9wZXJ0eSB0byBmaWx0ZXIgcmVjb3JkcyBvblxuICAgKiBAcGFyYW0gIHsqfSB2YWx1ZSAgICBWYWx1ZSB0byBmaWx0ZXIgZm9yXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgICBnZXRCeShwcm9wZXJ0eSwgdmFsdWUsIG5vdCkge1xuICAgIGxldCB0YXNrcyA9IHRoaXMudGFibGUucXVlcnkoKTtcbiAgICBpZiAobm90KVxuICAgICAgcmV0dXJuIHRhc2tzLmZpbHRlcihyZWNvcmQgPT4gcmVjb3JkW3Byb3BlcnR5XSAhPT0gdmFsdWUpO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiB0YXNrcy5maWx0ZXIocmVjb3JkID0+IHJlY29yZFtwcm9wZXJ0eV0gPT09IHZhbHVlKTtcbiAgfSxcblxuICBnZXRCeUhhc2h0YWcoaGFzaHRhZykge1xuICAgIGxldCB0YXNrcyA9IHRoaXMudGFibGUucXVlcnkoKTtcblxuICAgIHJldHVybiB0YXNrcy5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xuICAgICAgbGV0IHRhZ3MgPSB0YXNrLmdldCgnaGFzaHRhZ3MnKTtcbiAgICAgIHJldHVybiB0YWdzLmxlbmd0aCgpICYmIH50YWdzLnRvQXJyYXkoKS5pbmRleE9mKGhhc2h0YWcpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2V0IGhhc2h0YWdzIGZyb20gc3RvcmUncyByZWNvcmRzXG4gICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICovXG4gICAgZ2V0SGFzaHRhZ3MoKSB7XG4gICAgdmFyIGhhc2h0YWdzID0gW107XG4gICAgbGV0IHRhc2tzID0gdGhpcy50YWJsZS5xdWVyeSgpO1xuXG4gICAgdGFza3MuZm9yRWFjaCgodGFzayk9PiB7XG4gICAgICBsZXQgdGFza1RhZ3MgPSB0YXNrLmdldCgnaGFzaHRhZ3MnKTtcbiAgICAgIGlmICh0YXNrVGFncy5sZW5ndGgoKSkge1xuICAgICAgICBoYXNodGFncyA9IGhhc2h0YWdzLmNvbmNhdCh0YXNrVGFncy50b0FycmF5KCkpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGhhc2h0YWdzO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2V0IGFycmF5IG9mIGhhc2h0YWdzIGZyb20gdGV4dFxuICAgKiBAcGFyYW0gIHtTdHJpbmd9IHRleHQgVGV4dCB0byBzZWFyY2ggZm9yIGhhc2h0YWdzXG4gICAqIEByZXR1cm4ge0FycmF5fSAgICAgIExpc3Qgb2YgaGFzaHRhZ3NcbiAgICovXG4gICAgcGFyc2VIYXNodGFncyh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQubWF0Y2goLygjW2EtelxcZF1bXFx3LV0qKS9pZykgfHwgW107XG4gIH0sXG5cbiAgZW1pdENoYW5nZTogZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbWl0KENIQU5HRV9FVkVOVCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqL1xuICBhZGRDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB0aGlzLm9uKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBjYWxsYmFja1xuICAgKi9cbiAgcmVtb3ZlQ2hhbmdlTGlzdGVuZXI6IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdGhpcy5yZW1vdmVMaXN0ZW5lcihDSEFOR0VfRVZFTlQsIGNhbGxiYWNrKTtcbiAgfVxufSk7XG5cbi8qKlxuICogQ3VycmVudGx5IGxvZ2dlZCBpbiB1c2VyIGlmIGN1cnJlbnQgdXNlclxuICogQHR5cGUge29iamVjdH1cbiAqL1xubGV0IGN1cnJlbnRVc2VyID0gUGFyc2UuVXNlci5jdXJyZW50KCk7XG5cbi8vIENoZWNrIHVzZXIgYXV0aGVudGljYXRpb25cbmlmIChjdXJyZW50VXNlcikge1xuICBjb25zb2xlLmxvZyhjdXJyZW50VXNlcik7XG59XG5lbHNlIHtcbiAgUGFyc2UuVXNlci5sb2dJbih1c2VybmFtZSwge1xuICAgIHN1Y2Nlc3M6ICh1c2VyKSA9PiB7XG4gICAgICB0aGlzLnVuZGVsZWdhdGVFdmVudHMoKTtcbiAgICB9LFxuICAgIGVycm9yOiAodXNlciwgZXJyb3IpID0+IHtcbiAgICAgIHRoaXMuJChcIi5sb2dpbi1mb3JtIC5lcnJvclwiKS5odG1sKFwiSW52YWxpZCB1c2VybmFtZSBvciBwYXNzd29yZC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIikuc2hvdygpO1xuICAgICAgdGhpcy4kKFwiLmxvZ2luLWZvcm0gYnV0dG9uXCIpLnJlbW92ZUF0dHIoXCJkaXNhYmxlZFwiKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBSZWdpc3RlciBjYWxsYmFjayB0byBoYW5kbGUgYWxsIHVwZGF0ZXNcbmRpc3BhdGNoZXIucmVnaXN0ZXIoZnVuY3Rpb24oYWN0aW9uKSB7XG4gIGxldCB0ZXh0O1xuXG4gIHN3aXRjaChhY3Rpb24uYWN0aW9uVHlwZSkge1xuICAgIGNhc2UgVGFza0NvbnN0YW50cy5DUkVBVEU6XG4gICAgICBpZiAoYWN0aW9uLmRhdGEuZGVzY3JpcHRpb24gIT09ICcnKSB7XG4gICAgICAgIFRhc2tzLmNyZWF0ZShhY3Rpb24uZGF0YSk7XG4gICAgICAgIFRhc2tzLmVtaXRDaGFuZ2UoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLlRPR0dMRV9DT01QTEVURV9BTEw6XG4gICAgICBpZiAoVGFza3MuYXJlQWxsQ29tcGxldGUoKSkge1xuICAgICAgICBUYXNrcy51cGRhdGVBbGwoe2NvbXBsZXRlOiBmYWxzZX0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgVGFza3MudXBkYXRlQWxsKHtjb21wbGV0ZTogdHJ1ZX0pO1xuICAgICAgfVxuICAgICAgVGFza3MuZW1pdENoYW5nZSgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuVU5ET19DT01QTEVURTpcbiAgICAgIFRhc2tzLnVwZGF0ZShhY3Rpb24uaWQsIHtjb21wbGV0ZTogZmFsc2V9KTtcbiAgICAgIFRhc2tzLmVtaXRDaGFuZ2UoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLkNPTVBMRVRFOlxuICAgICAgVGFza3MudXBkYXRlKGFjdGlvbi5pZCwge2NvbXBsZXRlOiB0cnVlfSk7XG4gICAgICBUYXNrcy5lbWl0Q2hhbmdlKCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgVGFza0NvbnN0YW50cy5VUERBVEU6XG4gICAgICB0ZXh0ID0gYWN0aW9uLnRleHQudHJpbSgpO1xuICAgICAgaWYgKHRleHQgIT09ICcnKSB7XG4gICAgICAgIFRhc2tzLnVwZGF0ZShhY3Rpb24uaWQsIHt0ZXh0OiB0ZXh0fSk7XG4gICAgICAgIFRhc2tzLmVtaXRDaGFuZ2UoKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLkRFU1RST1k6XG4gICAgICBUYXNrcy5kZXN0cm95KGFjdGlvbi5pZCk7XG4gICAgICBUYXNrcy5lbWl0Q2hhbmdlKCk7XG4gICAgICBicmVhaztcblxuICAgIGRlZmF1bHQ6XG4gICAgLy8gbm8gb3BcbiAgfVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgX2lzTG9hZGVkLFxuICBtb2RlbDogVGFzayxcbiAgY29sbGVjdGlvbjogVGFza0NvbGxlY3Rpb25cbn1cbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4uL2FwcC9kaXNwYXRjaGVyJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vYXBwL2NvbnN0YW50cyc7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBnZXRJbml0aWFsU3RhdGUoKSB7XG4gICAgcmV0dXJuIHt9O1xuICB9LFxuXG4gIC8qKlxuICAgKiBIYW5kbGUgZm9ybSBzdWJtaXNzaW9uXG4gICAqIEBwYXJhbSB7U3ludGhldGljRXZlbnR9IGV2ZW50XG4gICAqL1xuICBvblN1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBFbXB0eSBpbnB1dCB2YWx1ZVxuICAgIHRoaXMuc2V0U3RhdGUoeyB2YWx1ZTogJycgfSk7XG5cbiAgICAvLyBEaXNwYXRjaCB0YXNrIGNyZWF0aW9uIGV2ZW50XG4gICAgZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiBjb25zdGFudHMuVEFTS1MuQ1JFQVRFLFxuICAgICAgZGF0YToge1xuICAgICAgICBkZXNjcmlwdGlvbjogdGhpcy5yZWZzLm5hbWUuZ2V0RE9NTm9kZSgpLnZhbHVlXG4gICAgICB9XG4gICAgfSlcbiAgfSxcblxuICAvKipcbiAgICogU2V0IHZhbHVlIG9mIGlucHV0IGZpZWxkIHRvIHN0YXRlLnZhbHVlIG9uIGNoYW5nZVxuICAgKi9cbiAgb25DaGFuZ2UoKSB7XG4gICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiB0aGlzLnJlZnMubmFtZS5nZXRET01Ob2RlKCkudmFsdWUgfSk7XG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJjYXJkXCI+XG4gICAgICAgIDxmb3JtIGNsYXNzTmFtZT1cInRhc2stZm9ybVwiIG9uU3VibWl0PXt0aGlzLm9uU3VibWl0fT5cbiAgICAgICAgICA8aW5wdXQgb25DaGFuZ2U9e3RoaXMub25DaGFuZ2V9XG4gICAgICAgICAgICAgICAgIHBsYWNlaG9sZGVyPVwiU2VhcmNoIHRhc2tzIG9yIGNyZWF0ZSBuZXcgdGFza1wiXG4gICAgICAgICAgICAgICAgIHJlZj1cIm5hbWVcIlxuICAgICAgICAgICAgICAgICByZXF1aXJlZFxuICAgICAgICAgICAgICAgICB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgIHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfS8+XG4gICAgICAgIDwvZm9ybT5cbiAgICAgIDwvc2VjdGlvbj5cbiAgICApO1xuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgb25FZGl0Q2xpY2soKSB7XG5cbiAgfSxcblxuICBvbkRlbGV0ZUNsaWNrKCkge1xuXG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8dWwgY2xhc3NOYW1lPVwidGFzay1saXN0XCI+XG4gICAgICAgIHt0aGlzLnByb3BzLnRhc2tzLm1hcCgodGFzaykgPT4ge1xuICAgICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8bGkga2V5PXt0YXNrLmlkfSBjbGFzc05hbWU9XCJ0YXNrLWxpc3QtaXRlbSBjYXJkXCI+XG4gICAgICAgICAgICAgIDxpbnB1dCB0eXBlPVwiY2hlY2tib3hcIiB2YWx1ZT17dGFzay5jb21wbGV0ZWR9IC8+XG4gICAgICAgICAgICAgIDxzcGFuPnt0YXNrLmRlc2NyaXB0aW9ufTwvc3Bhbj5cbiAgICAgICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJwdWxsLXJpZ2h0XCI+XG4gICAgICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtZWRpdFwiIG9uQ2xpY2s9e3RoaXMub25FZGl0Q2xpY2t9PjwvaT5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1jbG9zZVwiIG9uQ2xpY2s9e3RoaXMub25EZWxldGVDbGlja30+PC9pPlxuICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgKTtcbiAgICAgICAgfSl9XG4gICAgICA8L3VsPlxuICAgICk7XG4gIH1cblxufSk7XG4iXX0=
