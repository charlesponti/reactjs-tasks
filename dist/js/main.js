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
var Task = Parse.Object.extend("TaskObject");

/**
 * Collection for taskss
 * @type {Selection.extend}
 */
var TaskCollection = new Parse.Collection.extend({

  // Set model of collection
  model: Task,

  /**
   * True if store has been loaded, false if it has not
   * @type {boolean}
   */
  isLoaded: false,

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

// Check user authentication
if (Tasks.currentUser) {
  console.log(Tasks.currentUser);
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

Tasks.model = Task;

Tasks.collection = TaskCollection;

module.exports = Tasks;

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL21haW4uanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FjdGl2aXR5L2FjdGl2aXR5LWZvcm0uanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FjdGl2aXR5L2FjdGl2aXR5LWxpc3QuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FjdGl2aXR5L2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvY29uc3RhbnRzLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvZGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYXBwL2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvcm91dGVzLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9hcHAuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3BhZ2VzL2hvbWUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3BhZ2VzL25vdC1mb3VuZC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvcGFnZXMvc2lnbi11cC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvdGFza3MvaGFzaHRhZ3MuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3Rhc2tzL2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy9zdG9yZS5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvdGFza3MvdGFzay1mb3JtLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy90YXNrLWxpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7QUFFYixNQUFNLENBQUMsS0FBSyxDQUNULFVBQVUsQ0FDVCwwQ0FBMEMsRUFDMUMsMENBQTBDLENBQzNDLENBQUM7O0lBRUcsS0FBSywyQkFBTSxPQUFPOztJQUNsQixNQUFNLDJCQUFNLGNBQWM7O0lBQzFCLEdBQUcsMkJBQU0sT0FBTzs7O0FBR3ZCLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsT0FBTyxFQUFFO0FBQ3hDLE9BQUssQ0FBQyxNQUFNLENBQUMsb0JBQUMsT0FBTyxPQUFFLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0NBQzFELENBQUMsQ0FBQzs7O0FDakJILFlBQVksQ0FBQzs7QUFFYixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRWpDLFVBQVEsRUFBQSxrQkFBQyxLQUFLLEVBQUU7QUFDZCxTQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7R0FFeEI7O0FBRUQsUUFBTSxFQUFBLGtC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SyxDQUFDLEtBQUssQUFBQyxHQUFFO09BQzVCO0tBQ0MsQ0FDVjtHQUNIOztDQUVGLENBQUM7OztBQ3JERixZQUFZLENBQUM7Ozs7SUFFTixLQUFLLDJCQUFNLE9BQU87O2lCQUVWLEtBQUssQ0FBQyxXQUFXLENBQUM7OztBQUUvQixhQUFXLEVBQUEsdUJBQUcsRUFFYjs7QUFFRCxlQUFhLEVBQUEseUJBQUcsRUFFZjs7QUFFRCxRQUFNLEVBQUEsa0JBQUc7OztBQUNQLFdBQ0U7O1FBQUksU0FBUyxFQUFDLFdBQVc7TUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUMsSUFBSSxFQUFLO0FBQzlCLGVBQ0U7O1lBQUksR0FBRyxFQUFFLElBQUksQ0FBQyxFQUFFLEFBQUMsRUFBQyxTQUFTLEVBQUMscUJBQXFCO1VBQy9DLCtCQUFPLElBQUksRUFBQyxVQUFVLEVBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxTQUFTLEFBQUMsR0FBRztVQUNoRDs7O1lBQU8sSUFBSSxDQUFDLFdBQVc7V0FBUTtVQUMvQjs7Y0FBSyxTQUFTLEVBQUMsWUFBWTtZQUN6QiwyQkFBRyxTQUFTLEVBQUMsWUFBWSxFQUFDLE9BQU8sRUFBRSxNQUFLLFdBQVcsQUFBQyxHQUFLO1lBQ3pELDJCQUFHLFNBQVMsRUFBQyxhQUFhLEVBQUMsT0FBTyxFQUFFLE1BQUssYUFBYSxBQUFDLEdBQUs7V0FDeEQ7U0FDSCxDQUNMO09BQ0gsQ0FBQztLQUNDLENBQ0w7R0FDSDs7Q0FFRixDQUFDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcblxud2luZG93LlBhcnNlXG4gIC5pbml0aWFsaXplKFxuICAgIFwiRDF5VXRoSGNSTnZUeWFteWUyd1J6cUFielMyZ0I1b1hPMTllWGU4TFwiLFxuICAgIFwiMG9lYUpTZ3NjcHJoOVNIR0RaR2lmd1F4cU5ybm40Q0Rnd09tRHNzTVwiXG4gICk7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUm91dGVyIGZyb20gJ3JlYWN0LXJvdXRlcic7XG5pbXBvcnQgQXBwIGZyb20gJy4vYXBwJztcblxuLy8gSW5pdGlhbGl6ZSBUb3VjaEV2ZW50c1xuUmVhY3QuaW5pdGlhbGl6ZVRvdWNoRXZlbnRzKHRydWUpO1xuXG5Sb3V0ZXIucnVuKEFwcC5yb3V0ZXMsIGZ1bmN0aW9uIChIYW5kbGVyKSB7XG4gIFJlYWN0LnJlbmRlcig8SGFuZGxlci8+LCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYXBwJykpO1xufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgb25TdWJtaXQoZXZlbnQpIHtcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gIH0sXG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8Zm9ybSBvblN1Ym1pdD17dGhpcy5vblN1Ym1pdH0+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwidGV4dFwiIG5hbWU9XCJhY3Rpdml0eS5uYW1lXCIgcmVmPVwibmFtZVwiIC8+XG4gICAgICAgIDxidXR0b24+IFN0YXJ0IFRyYWNraW5nIDwvYnV0dG9uPlxuICAgICAgPC9mb3JtPlxuICAgIClcbiAgfVxuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bD5cbiAgICAgIDwvdWw+XG4gICAgKVxuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5jb25zdCBBY3Rpdml0eUZvcm0gPSByZXF1aXJlKCcuL2FjdGl2aXR5LWZvcm0nKTtcbmNvbnN0IEFjdGl2aXR5TGlzdCA9IHJlcXVpcmUoJy4vYWN0aXZpdHktbGlzdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoMyBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPiBBY3Rpdml0eSA8L2gzPlxuICAgICAgICA8QWN0aXZpdHlGb3JtIC8+XG4gICAgICAgIDxBY3Rpdml0eUxpc3QgLz5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG59KTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgVEFTS1M6IHtcbiAgICBDT01QTEVURTogJ3Rhc2s6Y29tcGxldGUnLFxuICAgIENSRUFURTogJ3Rhc2s6Y3JlYXRlJyxcbiAgICBERVNUUk9ZOiAndGFzazpkZXN0cm95JyxcbiAgICBVTkRPX0NPTVBMRVRFOiAndGFzazp1bmRvLWNvbXBsZXRlJyxcbiAgICBVUERBVEU6ICd0YXNrOnVwZGF0ZScsXG4gICAgVE9HR0xFX0NPTVBMRVRFX0FMTDogJ3Rhc2tzOmNvbXBsZXRlLWFsbCdcbiAgfSxcblxuICBVU0VSOiB7XG4gICAgQVVUSEVOVElDQVRFRDogJ3VzZXI6YXV0aGVudGljYXRlZCcsXG4gICAgVU5BVVRIRU5USUNBVEVEOiAndXNlcjp1bmF1dGhlbnRpY2F0ZWQnXG4gIH0sXG5cbiAgRklSRUJBU0U6IHtcbiAgICBBRERFRDogJ2NoaWxkX2FkZGVkJ1xuICB9XG5cbn1cblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEaXNwYXRjaGVyKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4vZGlzcGF0Y2hlcic7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCByb3V0ZXMgZnJvbSAnLi9yb3V0ZXMnO1xuXG5leHBvcnQgZGVmYXVsdCB7XG5cbiAgZGlzcGF0Y2hlcjogZGlzcGF0Y2hlcixcblxuICBjb25zdGFudHM6IGNvbnN0YW50cyxcblxuICByb3V0ZXM6IHJvdXRlc1xuXG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBDb21wb25lbnRzXG5pbXBvcnQgQXBwIGZyb20gJy4uL3BhZ2VzL2FwcCc7XG5pbXBvcnQgSG9tZSBmcm9tICcuLi9wYWdlcy9ob21lJztcbmltcG9ydCBOb3RGb3VuZCBmcm9tICcuLi9wYWdlcy9ub3QtZm91bmQnO1xuaW1wb3J0IFRhc2tQYWdlIGZyb20gJy4uL3Rhc2tzJztcbmltcG9ydCBBY3Rpdml0eVBhZ2UgZnJvbSAnLi4vYWN0aXZpdHknO1xuXG4vLyBEZXBlbmRlbmNpZXNcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUm91dGVyIGZyb20gJ3JlYWN0LXJvdXRlcic7XG5cbmxldCBSb3V0ZSAgPSBSb3V0ZXIuUm91dGU7XG5sZXQgRGVmYXVsdFJvdXRlID0gUm91dGVyLkRlZmF1bHRSb3V0ZTtcbmxldCBOb3RGb3VuZFJvdXRlID0gUm91dGVyLk5vdEZvdW5kUm91dGU7XG5cbnZhciByb3V0ZXMgPSAoXG4gIDxSb3V0ZSBwYXRoPVwiL1wiIGhhbmRsZXI9e0FwcH0+XG4gICAgPERlZmF1bHRSb3V0ZSBoYW5kbGVyPXtIb21lfSAvPlxuICAgIDxOb3RGb3VuZFJvdXRlIGhhbmRsZXI9e05vdEZvdW5kfS8+XG4gICAgPFJvdXRlIHBhdGg9XCJ0YXNrc1wiIGhhbmRsZXI9e1Rhc2tQYWdlfSAvPlxuICAgIDxSb3V0ZSBwYXRoPVwiYWN0aXZpdHlcIiBoYW5kbGVyPXtBY3Rpdml0eVBhZ2V9IC8+XG4gIDwvUm91dGU+XG4pO1xuXG5leHBvcnQgZGVmYXVsdCByb3V0ZXM7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1JvdXRlSGFuZGxlcn0gZnJvbSAncmVhY3Qtcm91dGVyJztcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4uL2FwcC9kaXNwYXRjaGVyJztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgey8qIHRoaXMgaXMgdGhlIGltcG9ydGFudCBwYXJ0ICovfVxuICAgICAgICA8Um91dGVIYW5kbGVyLz5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBTaWduVXAgZnJvbSAnLi9zaWduLXVwLmpzJztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgYXV0aGVudGljYXRlZDogUGFyc2UuVXNlci5jdXJyZW50KClcbiAgICB9XG4gIH0sXG5cbiAgY29ubmVjdERyb3Bib3goKSB7XG4gICAgaWYgKCF0aGlzLnN0YXRlLmF1dGhlbnRpY2F0ZWQpIHtcblxuICAgIH1cbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgbGV0IG1hcmt1cDtcblxuICAgIGlmICghdGhpcy5zdGF0ZS5hdXRoZW50aWNhdGVkKSB7XG4gICAgICBtYXJrdXAgPSA8U2lnblVwLz47XG4gICAgfSBlbHNlIHtcbiAgICAgIG1hcmt1cCA9IChcbiAgICAgICAgPGJ1dHRvbj5cbiAgICAgICAgICA8YSBocmVmPVwiIy90YXNrc1wiPlRhc2tzPC9hPlxuICAgICAgICA8L2J1dHRvbj5cbiAgICAgIClcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwidGV4dC1jZW50ZXIgaG9tZVwiPlxuICAgICAgICB7bWFya3VwfVxuICAgICAgPC9zZWN0aW9uPlxuICAgIClcbiAgfVxuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY2xhc3MgTm90Rm91bmQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGgxPiBXaGF0IFlvdSBUYWxraW5nIEFib3V0LCBXaWxsaXM/PC9oMT5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuXG5cbmV4cG9ydCBkZWZhdWx0IE5vdEZvdW5kO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jb25zdCBTaWduVXAgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aW5wdXQgdHlwZT1cImVtYWlsXCIgcGxhY2Vob2xkZXI9XCIgRW1haWwgQWRkcmVzc1wiIC8+XG4gICAgICAgIDxidXR0b24+IFNpZ24gVXAgPC9idXR0b24+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBTaWduVXA7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlcic7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBnZXRJbml0aWFsU3RhdGUoLi4ucHJvcHMpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG5cbiAgX29uQ2xpY2soaGFzaHRhZykge1xuICAgIC8vIENoZWNrIGlmIGhhc2h0YWcgaXMgc2FtZSBhcyBjdXJyZW50bHkgc2VsZWN0ZWRcbiAgICBsZXQgaXNTZWxlY3RlZCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWQgPT09IGhhc2h0YWc7XG5cbiAgICAvLyBTZXQgc2VsZWN0ZWQgaGFzaHRhZyB0byBzdGF0ZVxuICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZDogaGFzaHRhZyB9KTtcblxuICAgIC8vIERpc3BhdGNoIHNlYXJjaCBieSBoYXNodGFnXG4gICAgZGlzcGF0Y2hlci5kaXNwYXRjaCh7XG4gICAgICBhY3Rpb25UeXBlOiAnc2VhcmNoOmhhc2h0YWcnLFxuICAgICAgZGF0YTogaXNTZWxlY3RlZCA/IHVuZGVmaW5lZCA6IGhhc2h0YWdcbiAgICB9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9XCJ0YXNrLWhhc2h0YWdzLWxpc3RcIj5cbiAgICAgICAge3RoaXMucHJvcHMuaGFzaHRhZ3MubWFwKChoYXNoVGFnKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxsaSBrZXk9e2hhc2hUYWd9XG4gICAgICAgICAgICAgICAgY2xhc3NOYW1lPXt7c2VsZWN0ZWQ6IHRoaXMuc3RhdGUuc2VsZWN0ZWQgPT09IGhhc2hUYWcgfX0+XG4gICAgICAgICAgICAgIDxhIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2suYmluZCh0aGlzLCBoYXNoVGFnKX0+XG4gICAgICAgICAgICAgICAge3toYXNoVGFnfX1cbiAgICAgICAgICAgICAgPC9hPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApO1xuICAgICAgICB9KX1cbiAgICAgIDwvdWw+XG4gICAgKTtcbiAgfVxuXG59KTtcblxuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFRhc2tMaXN0IGZyb20gJy4vdGFzay1saXN0JztcbmltcG9ydCBUYXNrcyBmcm9tICcuL3N0b3JlJztcbmltcG9ydCBUYXNrRm9ybSBmcm9tICcuL3Rhc2stZm9ybSc7XG5pbXBvcnQgSGFzaHRhZ3MgZnJvbSAnLi9oYXNodGFncyc7XG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlcic7XG5cbmNsYXNzIFRhc2tQYWdlIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBsb2FkZWQ6IFRhc2tzLl9pc0xvYWRlZCxcbiAgICAgIHRhc2tzOiAgVGFza3MuX2lzTG9hZGVkID8gVGFza3MudGFza3MgOiBbXVxuICAgIH1cbiAgfVxuXG4gIF9vbkNoYW5nZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHsgdGFza3M6IFRhc2tTdG9yZS5nZXRBbGwoKSB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxNb3VudCgpIHtcbiAgICBUYXNrcy5jb2xsZWN0aW9uLmZldGNoKHtcbiAgICAgIHN1Y2Nlc3M6IGZ1bmN0aW9uKCkge1xuICAgICAgICBkZWJ1Z2dlcjtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGNvbXBvbmVudERpZE1vdW50KCkge1xuICAgIC8vIFJlZ2lzdGVyIHdpdGggYXBwIGRpc3BhdGNoZXJcbiAgICB0aGlzLnRva2VuID0gZGlzcGF0Y2hlci5yZWdpc3RlcigocGF5bG9hZCkgPT4ge1xuICAgICAgc3dpdGNoIChwYXlsb2FkLmFjdGlvblR5cGUpIHtcbiAgICAgICAgY2FzZSAnc2VhcmNoOmhhc2h0YWcnOlxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgdGFza3M6IFRhc2tzLmdldEJ5SGFzaHRhZyhwYXlsb2FkLmRhdGEpXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ3Rhc2tzOmxvYWQnOlxuICAgICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgbG9hZGVkOiB0cnVlLFxuICAgICAgICAgICAgdGFza3M6IFRhc2tzLnRhYmxlLnF1ZXJ5KClcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIFdhdGNoIGZvciBjaGFuZ2VzIHRvIFRhc2tzXG4gICAgVGFza3MuY29sbGVjdGlvbi5vbignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UuYmluZCh0aGlzKSk7XG4gIH1cblxuICBjb21wb25lbnRXaWxsVW5tb3VudCgpIHtcbiAgICAvLyBVbnJlZ2lzdGVyIGZyb20gYXBwIGRpc3BhdGNoZXJcbiAgICBkaXNwYXRjaGVyLnVucmVnaXN0ZXIodGhpcy50b2tlbik7XG4gICAgLy8gVW53YXRjaCBmb3IgY2hhbmdlcyB0byBUYXNrc1xuICAgIFRhc2tzLmNvbGxlY3Rpb24ub24oJ2NoYW5nZScsIHRoaXMuX29uQ2hhbmdlLmJpbmQodGhpcykpO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCB0YXNrcyA9IHRoaXMuc3RhdGUudGFza3MubWFwKCh0YXNrKSA9PiB7XG4gICAgICByZXR1cm4gdGFzay5nZXRGaWVsZHMoKTtcbiAgICB9KTtcblxuICAgIGxldCBoYXNodGFncyA9IFRhc2tzLl9pc0xvYWRlZCA/IFRhc2tzLmdldEhhc2h0YWdzKCkgOiBbXTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT1cInBhZ2VcIj5cbiAgICAgICAgPGg0IGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+IFRhc2tzIDwvaDQ+XG4gICAgICAgIDxIYXNodGFncyBoYXNodGFncz17aGFzaHRhZ3N9Lz5cbiAgICAgICAgPFRhc2tGb3JtIC8+XG4gICAgICAgIHt0aGlzLnN0YXRlLmxvYWRlZCA/IDxUYXNrTGlzdCB0YXNrcz17dGFza3N9Lz4gOiAoXG4gICAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPlxuICAgICAgICAgICAgPGkgY2xhc3NOYW1lPVwiZmEgZmEtc3Bpbm5lciBmYS1zcGluIGZhLTJ4XCI+PC9pPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuXG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGFza1BhZ2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4uL2FwcC9kaXNwYXRjaGVyLmpzJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi4vYXBwL2NvbnN0YW50cy5qcyc7XG5pbXBvcnQgXyBmcm9tICdsb2Rhc2gnO1xuXG4vKipcbiAqIFJlZmVyZW5jZSB0byB0aGlzIGZpbGUncyBtb2R1bGVcbiAqIEB0eXBlIHt7fX1cbiAqL1xubGV0IFRhc2tzID0ge307XG5cbi8qKlxuICogV2hldGhlciBzdG9yZSBoYXMgYmVlbiBsb2FkZWRcbiAqIEB0eXBlIHtib29sZWFufVxuICogQHByaXZhdGVcbiAqL1xuVGFza3MuaXNMb2FkZWQgPSBmYWxzZTtcblxuLyoqXG4gKiBDdXJyZW50bHkgbG9nZ2VkIGluIHVzZXIgaWYgY3VycmVudCB1c2VyXG4gKiBAdHlwZSB7b2JqZWN0fVxuICovXG5UYXNrcy5jdXJyZW50VXNlciA9IFBhcnNlLlVzZXIuY3VycmVudCgpO1xuXG5jb25zdCBUYXNrQ29uc3RhbnRzID0gY29uc3RhbnRzLlRBU0tTO1xuY29uc3QgQ0hBTkdFX0VWRU5UID0gJ2NoYW5nZSc7XG5cbi8qKlxuICogTW9kZWwgZm9yIHRhc2tzXG4gKi9cbmNvbnN0IFRhc2sgPSBQYXJzZS5PYmplY3QuZXh0ZW5kKCdUYXNrT2JqZWN0Jyk7XG5cbi8qKlxuICogQ29sbGVjdGlvbiBmb3IgdGFza3NzXG4gKiBAdHlwZSB7U2VsZWN0aW9uLmV4dGVuZH1cbiAqL1xubGV0IFRhc2tDb2xsZWN0aW9uID0gbmV3IFBhcnNlLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuICAvLyBTZXQgbW9kZWwgb2YgY29sbGVjdGlvblxuICBtb2RlbDogVGFzayxcblxuICAvKipcbiAgICogVHJ1ZSBpZiBzdG9yZSBoYXMgYmVlbiBsb2FkZWQsIGZhbHNlIGlmIGl0IGhhcyBub3RcbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqL1xuICBpc0xvYWRlZDogZmFsc2UsXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyB0YXNrXG4gICAqIEBwYXJhbSAge3N0cmluZ30gdGFza1xuICAgKi9cbiAgICBjcmVhdGUodGFzaykge1xuICAgIHRhc2suaWQgPSAoK25ldyBEYXRlKCkgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA5OTk5OTkpKS50b1N0cmluZygzNik7XG4gICAgdGFzay5jb21wbGV0ZSA9IGZhbHNlO1xuICAgIHRhc2suaGFzaHRhZ3MgPSBUYXNrQ29sbGVjdGlvbi5wYXJzZUhhc2h0YWdzKHRhc2suZGVzY3JpcHRpb24pO1xuICAgIHRoaXMudGFibGUuaW5zZXJ0KHRhc2spO1xuICB9LFxuXG4gIC8qKlxuICAgKiBVcGRhdGUgYSBUT0RPIGl0ZW0uXG4gICAqIEBwYXJhbSAge3N0cmluZ30gaWRcbiAgICogQHBhcmFtIHtvYmplY3R9IHVwZGF0ZXMgQW4gb2JqZWN0IGxpdGVyYWwgY29udGFpbmluZyBvbmx5IHRoZSBkYXRhIHRvIGJlXG4gICAqICAgICB1cGRhdGVkLlxuICAgKi9cbiAgICB1cGRhdGUoaWQsIHVwZGF0ZXMpIHtcbiAgICB2YXIgdGFzayA9IHRoaXMudGFibGUucXVlcnkoeyBpZDogaWQgfSlbMF07XG4gICAgaWYgKHRhc2spIHtcbiAgICAgIHJldHVybiBPYmplY3Qua2V5cyh1cGRhdGVzKS5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgcmV0dXJuIHRhc2suc2V0KGtleSwgdXBkYXRlc1trZXldKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY29uc29sZS53YXJuKGBUYXNrICR7aWR9IGNvdWxkIG5vdCBiZSBmb3VuZGApO1xuICAgIH1cbiAgfSxcblxuICAvKipcbiAgICogVXBkYXRlIGFsbCBvZiB0aGUgVE9ETyBpdGVtcyB3aXRoIHRoZSBzYW1lIG9iamVjdC5cbiAgICogICAgIHRoZSBkYXRhIHRvIGJlIHVwZGF0ZWQuICBVc2VkIHRvIG1hcmsgYWxsIFRPRE9zIGFzIGNvbXBsZXRlZC5cbiAgICogQHBhcmFtICB7b2JqZWN0fSB1cGRhdGVzIEFuIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5pbmcgb25seSB0aGUgZGF0YSB0byBiZVxuICAgKiAgICAgdXBkYXRlZC5cbiAgICovXG4gICAgdXBkYXRlQWxsKHVwZGF0ZXMpIHtcbiAgICBsZXQgdGFza3MgPSB0aGlzLnRhYmxlLnF1ZXJ5KCk7XG4gICAgcmV0dXJuIHRhc2tzLmZvckVhY2goZnVuY3Rpb24odGFzaykge1xuICAgICAgVGFza0NvbGxlY3Rpb24udXBkYXRlKHRhc2suZ2V0KCdpZCcpLCB1cGRhdGVzKTtcbiAgICB9KTtcbiAgfSxcblxuICAvKipcbiAgICogRGVsZXRlIGEgVE9ETyBpdGVtLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGlkXG4gICAqL1xuICAgIGRlc3Ryb3koaWQpIHtcbiAgICBkZWxldGUgX3Rhc2tzW2lkXTtcbiAgfSxcblxuICAvKipcbiAgICogRGVsZXRlIGFsbCB0aGUgY29tcGxldGVkIFRPRE8gaXRlbXMuXG4gICAqL1xuICAgIGRlc3Ryb3lDb21wbGV0ZWQoKSB7XG4gICAgZm9yICh2YXIgaWQgaW4gX3Rhc2tzKSB7XG4gICAgICBpZiAoX3Rhc2tzW2lkXS5jb21wbGV0ZSkge1xuICAgICAgICBkZXN0cm95KGlkKTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFRlc3RzIHdoZXRoZXIgYWxsIHRoZSByZW1haW5pbmcgVE9ETyBpdGVtcyBhcmUgbWFya2VkIGFzIGNvbXBsZXRlZC5cbiAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICovXG4gIGFyZUFsbENvbXBsZXRlOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBpZCBpbiBfdGFza3MpIHtcbiAgICAgIGlmICghX3Rhc2tzW2lkXS5jb21wbGV0ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9LFxuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGVudGlyZSBjb2xsZWN0aW9uIG9mIFRPRE9zLlxuICAgKiBAcmV0dXJuIHtvYmplY3R9XG4gICAqL1xuICBnZXRBbGw6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnRhYmxlLnF1ZXJ5KCk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHZXQgc3RvcmUncyByZWNvcmRzIGZpbHRlcmVkIG9uIHByb3BlcnR5IGJ5IHZhbHVlXG4gICAqIEBwYXJhbSAgeyp9IHByb3BlcnR5IFByb3BlcnR5IHRvIGZpbHRlciByZWNvcmRzIG9uXG4gICAqIEBwYXJhbSAgeyp9IHZhbHVlICAgIFZhbHVlIHRvIGZpbHRlciBmb3JcbiAgICogQHJldHVybiB7QXJyYXl9XG4gICAqL1xuICAgIGdldEJ5KHByb3BlcnR5LCB2YWx1ZSwgbm90KSB7XG4gICAgbGV0IHRhc2tzID0gdGhpcy50YWJsZS5xdWVyeSgpO1xuICAgIGlmIChub3QpXG4gICAgICByZXR1cm4gdGFza3MuZmlsdGVyKHJlY29yZCA9PiByZWNvcmRbcHJvcGVydHldICE9PSB2YWx1ZSk7XG4gICAgZWxzZVxuICAgICAgcmV0dXJuIHRhc2tzLmZpbHRlcihyZWNvcmQgPT4gcmVjb3JkW3Byb3BlcnR5XSA9PT0gdmFsdWUpO1xuICB9LFxuXG4gIGdldEJ5SGFzaHRhZyhoYXNodGFnKSB7XG4gICAgbGV0IHRhc2tzID0gdGhpcy50YWJsZS5xdWVyeSgpO1xuXG4gICAgcmV0dXJuIHRhc2tzLmZpbHRlcihmdW5jdGlvbih0YXNrKSB7XG4gICAgICBsZXQgdGFncyA9IHRhc2suZ2V0KCdoYXNodGFncycpO1xuICAgICAgcmV0dXJuIHRhZ3MubGVuZ3RoKCkgJiYgfnRhZ3MudG9BcnJheSgpLmluZGV4T2YoaGFzaHRhZyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHZXQgaGFzaHRhZ3MgZnJvbSBzdG9yZSdzIHJlY29yZHNcbiAgICogQHJldHVybnMge0FycmF5fVxuICAgKi9cbiAgICBnZXRIYXNodGFncygpIHtcbiAgICB2YXIgaGFzaHRhZ3MgPSBbXTtcbiAgICBsZXQgdGFza3MgPSB0aGlzLnRhYmxlLnF1ZXJ5KCk7XG5cbiAgICB0YXNrcy5mb3JFYWNoKCh0YXNrKT0+IHtcbiAgICAgIGxldCB0YXNrVGFncyA9IHRhc2suZ2V0KCdoYXNodGFncycpO1xuICAgICAgaWYgKHRhc2tUYWdzLmxlbmd0aCgpKSB7XG4gICAgICAgIGhhc2h0YWdzID0gaGFzaHRhZ3MuY29uY2F0KHRhc2tUYWdzLnRvQXJyYXkoKSk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaGFzaHRhZ3M7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHZXQgYXJyYXkgb2YgaGFzaHRhZ3MgZnJvbSB0ZXh0XG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGV4dCBUZXh0IHRvIHNlYXJjaCBmb3IgaGFzaHRhZ3NcbiAgICogQHJldHVybiB7QXJyYXl9ICAgICAgTGlzdCBvZiBoYXNodGFnc1xuICAgKi9cbiAgICBwYXJzZUhhc2h0YWdzKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC5tYXRjaCgvKCNbYS16XFxkXVtcXHctXSopL2lnKSB8fCBbXTtcbiAgfSxcblxuICBlbWl0Q2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVtaXQoQ0hBTkdFX0VWRU5UKTtcbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICovXG4gIGFkZENoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHRoaXMub24oQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqL1xuICByZW1vdmVDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG59KTtcblxuLy8gQ2hlY2sgdXNlciBhdXRoZW50aWNhdGlvblxuaWYgKFRhc2tzLmN1cnJlbnRVc2VyKSB7XG4gIGNvbnNvbGUubG9nKFRhc2tzLmN1cnJlbnRVc2VyKTtcbn1cbmVsc2Uge1xuICBQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCB7XG4gICAgc3VjY2VzczogKHVzZXIpID0+IHtcbiAgICAgIHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xuICAgIH0sXG4gICAgZXJyb3I6ICh1c2VyLCBlcnJvcikgPT4ge1xuICAgICAgdGhpcy4kKFwiLmxvZ2luLWZvcm0gLmVycm9yXCIpLmh0bWwoXCJJbnZhbGlkIHVzZXJuYW1lIG9yIHBhc3N3b3JkLiBQbGVhc2UgdHJ5IGFnYWluLlwiKS5zaG93KCk7XG4gICAgICB0aGlzLiQoXCIubG9naW4tZm9ybSBidXR0b25cIikucmVtb3ZlQXR0cihcImRpc2FibGVkXCIpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIFJlZ2lzdGVyIGNhbGxiYWNrIHRvIGhhbmRsZSBhbGwgdXBkYXRlc1xuZGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihhY3Rpb24pIHtcbiAgbGV0IHRleHQ7XG5cbiAgc3dpdGNoKGFjdGlvbi5hY3Rpb25UeXBlKSB7XG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLkNSRUFURTpcbiAgICAgIGlmIChhY3Rpb24uZGF0YS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgVGFza3MuY3JlYXRlKGFjdGlvbi5kYXRhKTtcbiAgICAgICAgVGFza3MuZW1pdENoYW5nZSgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuVE9HR0xFX0NPTVBMRVRFX0FMTDpcbiAgICAgIGlmIChUYXNrcy5hcmVBbGxDb21wbGV0ZSgpKSB7XG4gICAgICAgIFRhc2tzLnVwZGF0ZUFsbCh7Y29tcGxldGU6IGZhbHNlfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBUYXNrcy51cGRhdGVBbGwoe2NvbXBsZXRlOiB0cnVlfSk7XG4gICAgICB9XG4gICAgICBUYXNrcy5lbWl0Q2hhbmdlKCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgVGFza0NvbnN0YW50cy5VTkRPX0NPTVBMRVRFOlxuICAgICAgVGFza3MudXBkYXRlKGFjdGlvbi5pZCwge2NvbXBsZXRlOiBmYWxzZX0pO1xuICAgICAgVGFza3MuZW1pdENoYW5nZSgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuQ09NUExFVEU6XG4gICAgICBUYXNrcy51cGRhdGUoYWN0aW9uLmlkLCB7Y29tcGxldGU6IHRydWV9KTtcbiAgICAgIFRhc2tzLmVtaXRDaGFuZ2UoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLlVQREFURTpcbiAgICAgIHRleHQgPSBhY3Rpb24udGV4dC50cmltKCk7XG4gICAgICBpZiAodGV4dCAhPT0gJycpIHtcbiAgICAgICAgVGFza3MudXBkYXRlKGFjdGlvbi5pZCwge3RleHQ6IHRleHR9KTtcbiAgICAgICAgVGFza3MuZW1pdENoYW5nZSgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuREVTVFJPWTpcbiAgICAgIFRhc2tzLmRlc3Ryb3koYWN0aW9uLmlkKTtcbiAgICAgIFRhc2tzLmVtaXRDaGFuZ2UoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAvLyBubyBvcFxuICB9XG59KTtcblxuVGFza3MubW9kZWwgPSBUYXNrO1xuXG5UYXNrcy5jb2xsZWN0aW9uID0gVGFza0NvbGxlY3Rpb247XG5cbmV4cG9ydCBkZWZhdWx0IFRhc2tzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi9hcHAvY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhhbmRsZSBmb3JtIHN1Ym1pc3Npb25cbiAgICogQHBhcmFtIHtTeW50aGV0aWNFdmVudH0gZXZlbnRcbiAgICovXG4gIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIEVtcHR5IGlucHV0IHZhbHVlXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiAnJyB9KTtcblxuICAgIC8vIERpc3BhdGNoIHRhc2sgY3JlYXRpb24gZXZlbnRcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IGNvbnN0YW50cy5UQVNLUy5DUkVBVEUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnJlZnMubmFtZS5nZXRET01Ob2RlKCkudmFsdWVcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBTZXQgdmFsdWUgb2YgaW5wdXQgZmllbGQgdG8gc3RhdGUudmFsdWUgb24gY2hhbmdlXG4gICAqL1xuICBvbkNoYW5nZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IHRoaXMucmVmcy5uYW1lLmdldERPTU5vZGUoKS52YWx1ZSB9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImNhcmRcIj5cbiAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwidGFzay1mb3JtXCIgb25TdWJtaXQ9e3RoaXMub25TdWJtaXR9PlxuICAgICAgICAgIDxpbnB1dCBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggdGFza3Mgb3IgY3JlYXRlIG5ldyB0YXNrXCJcbiAgICAgICAgICAgICAgICAgcmVmPVwibmFtZVwiXG4gICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9Lz5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgPC9zZWN0aW9uPlxuICAgICk7XG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBvbkVkaXRDbGljaygpIHtcblxuICB9LFxuXG4gIG9uRGVsZXRlQ2xpY2soKSB7XG5cbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9XCJ0YXNrLWxpc3RcIj5cbiAgICAgICAge3RoaXMucHJvcHMudGFza3MubWFwKCh0YXNrKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxsaSBrZXk9e3Rhc2suaWR9IGNsYXNzTmFtZT1cInRhc2stbGlzdC1pdGVtIGNhcmRcIj5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPXt0YXNrLmNvbXBsZXRlZH0gLz5cbiAgICAgICAgICAgICAgPHNwYW4+e3Rhc2suZGVzY3JpcHRpb259PC9zcGFuPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB1bGwtcmlnaHRcIj5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1lZGl0XCIgb25DbGljaz17dGhpcy5vbkVkaXRDbGlja30+PC9pPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLWNsb3NlXCIgb25DbGljaz17dGhpcy5vbkRlbGV0ZUNsaWNrfT48L2k+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApO1xuICAgICAgICB9KX1cbiAgICAgIDwvdWw+XG4gICAgKTtcbiAgfVxuXG59KTtcbiJdfQ==
