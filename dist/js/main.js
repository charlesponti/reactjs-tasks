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

},{"../app/dispatcher":6,"./hashtags":13,"./store":15,"./task-form":16,"./task-list":17,"react":"react"}],15:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _toConsumableArray = function (arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } };

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
var TaskCollection = Parse.Collection.extend({

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
      return task.get("hashtags").length;
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

Tasks.collection = new TaskCollection();

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
          { key: task.get("objectId"), className: "task-list-item card" },
          React.createElement("input", { type: "checkbox", value: task.completed }),
          React.createElement(
            "span",
            null,
            task.get("title")
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL21haW4uanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FjdGl2aXR5L2FjdGl2aXR5LWZvcm0uanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FjdGl2aXR5L2FjdGl2aXR5LWxpc3QuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL2FjdGl2aXR5L2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvY29uc3RhbnRzLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvZGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvYXBwL2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9hcHAvcm91dGVzLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy9wYWdlcy9hcHAuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3BhZ2VzL2hvbWUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3BhZ2VzL25vdC1mb3VuZC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvcGFnZXMvc2lnbi11cC5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvdGFza3MvaGFzaHRhZ3MuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdGpzLWxpZmUvc3JjL3Rhc2tzL2luZGV4LmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy9zdG9yZS5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0anMtbGlmZS9zcmMvdGFza3MvdGFzay1mb3JtLmpzIiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3Rqcy1saWZlL3NyYy90YXNrcy90YXNrLWxpc3QuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7QUFFYixNQUFNLENBQUMsS0FBSyxDQUNULFVBQVUsQ0FDVCwwQ0FBMEMsRUFDMUMsMENBQTBDLENBQzNDLENBQUM7O0lBRUcsS0FBSywyQkFBTSxPQUFPOztJQUNsQixNQUFNLDJCQUFNLGNBQWM7O0lBQzFCLEdBQUcsMkJBQU0sT0FBTzs7O0FBR3ZCLEtBQUssQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7QUFFbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsT0FBTyxFQUFFO0FBQ3hDLE9BQUssQ0FBQyxNQUFNLENBQUMsb0JBQUMsT0FBTyxPQUFFLEVBQUUsUUFBUSxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO0NBQzFELENBQUMsQ0FBQzs7O0FDakJILFlBQVksQ0FBQzs7QUFFYixJQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7O0FBRS9CLE1BQU0sQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FBQzs7O0FBRWpDLFVBQVEsRUFBQSxrQkFBQyxLQUFLLEVBQUU7QUFDZCxTQUFLLENBQUMsY0FBYyxFQUFFLENBQUM7R0FFeEI7O0FBRUQsUUFBTSxFQUFBLGtC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OztDQUVGLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG53aW5kb3cuUGFyc2VcbiAgLmluaXRpYWxpemUoXG4gICAgXCJEMXlVdGhIY1JOdlR5YW15ZTJ3UnpxQWJ6UzJnQjVvWE8xOWVYZThMXCIsXG4gICAgXCIwb2VhSlNnc2Nwcmg5U0hHRFpHaWZ3UXhxTnJubjRDRGd3T21Ec3NNXCJcbiAgKTtcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSb3V0ZXIgZnJvbSAncmVhY3Qtcm91dGVyJztcbmltcG9ydCBBcHAgZnJvbSAnLi9hcHAnO1xuXG4vLyBJbml0aWFsaXplIFRvdWNoRXZlbnRzXG5SZWFjdC5pbml0aWFsaXplVG91Y2hFdmVudHModHJ1ZSk7XG5cblJvdXRlci5ydW4oQXBwLnJvdXRlcywgZnVuY3Rpb24gKEhhbmRsZXIpIHtcbiAgUmVhY3QucmVuZGVyKDxIYW5kbGVyLz4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhcHAnKSk7XG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuY29uc3QgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBvblN1Ym1pdChldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxmb3JtIG9uU3VibWl0PXt0aGlzLm9uU3VibWl0fT5cbiAgICAgICAgPGlucHV0IHR5cGU9XCJ0ZXh0XCIgbmFtZT1cImFjdGl2aXR5Lm5hbWVcIiByZWY9XCJuYW1lXCIgLz5cbiAgICAgICAgPGJ1dHRvbj4gU3RhcnQgVHJhY2tpbmcgPC9idXR0b24+XG4gICAgICA8L2Zvcm0+XG4gICAgKVxuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsPlxuICAgICAgPC91bD5cbiAgICApXG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmNvbnN0IFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbmNvbnN0IEFjdGl2aXR5Rm9ybSA9IHJlcXVpcmUoJy4vYWN0aXZpdHktZm9ybScpO1xuY29uc3QgQWN0aXZpdHlMaXN0ID0gcmVxdWlyZSgnLi9hY3Rpdml0eS1saXN0Jyk7XG5cbm1vZHVsZS5leHBvcnRzID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGgzIGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+IEFjdGl2aXR5IDwvaDM+XG4gICAgICAgIDxBY3Rpdml0eUZvcm0gLz5cbiAgICAgICAgPEFjdGl2aXR5TGlzdCAvPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn0pO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBUQVNLUzoge1xuICAgIENPTVBMRVRFOiAndGFzazpjb21wbGV0ZScsXG4gICAgQ1JFQVRFOiAndGFzazpjcmVhdGUnLFxuICAgIERFU1RST1k6ICd0YXNrOmRlc3Ryb3knLFxuICAgIFVORE9fQ09NUExFVEU6ICd0YXNrOnVuZG8tY29tcGxldGUnLFxuICAgIFVQREFURTogJ3Rhc2s6dXBkYXRlJyxcbiAgICBUT0dHTEVfQ09NUExFVEVfQUxMOiAndGFza3M6Y29tcGxldGUtYWxsJ1xuICB9LFxuXG4gIFVTRVI6IHtcbiAgICBBVVRIRU5USUNBVEVEOiAndXNlcjphdXRoZW50aWNhdGVkJyxcbiAgICBVTkFVVEhFTlRJQ0FURUQ6ICd1c2VyOnVuYXV0aGVudGljYXRlZCdcbiAgfSxcblxuICBGSVJFQkFTRToge1xuICAgIEFEREVEOiAnY2hpbGRfYWRkZWQnXG4gIH1cblxufVxuXG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IERpc3BhdGNoZXIoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi9kaXNwYXRjaGVyJztcbmltcG9ydCBjb25zdGFudHMgZnJvbSAnLi9jb25zdGFudHMnO1xuaW1wb3J0IHJvdXRlcyBmcm9tICcuL3JvdXRlcyc7XG5cbmV4cG9ydCBkZWZhdWx0IHtcblxuICBkaXNwYXRjaGVyOiBkaXNwYXRjaGVyLFxuXG4gIGNvbnN0YW50czogY29uc3RhbnRzLFxuXG4gIHJvdXRlczogcm91dGVzXG5cbn07XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBBcHAgZnJvbSAnLi4vcGFnZXMvYXBwJztcbmltcG9ydCBIb21lIGZyb20gJy4uL3BhZ2VzL2hvbWUnO1xuaW1wb3J0IE5vdEZvdW5kIGZyb20gJy4uL3BhZ2VzL25vdC1mb3VuZCc7XG5pbXBvcnQgVGFza1BhZ2UgZnJvbSAnLi4vdGFza3MnO1xuaW1wb3J0IEFjdGl2aXR5UGFnZSBmcm9tICcuLi9hY3Rpdml0eSc7XG5cbi8vIERlcGVuZGVuY2llc1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBSb3V0ZXIgZnJvbSAncmVhY3Qtcm91dGVyJztcblxubGV0IFJvdXRlICA9IFJvdXRlci5Sb3V0ZTtcbmxldCBEZWZhdWx0Um91dGUgPSBSb3V0ZXIuRGVmYXVsdFJvdXRlO1xubGV0IE5vdEZvdW5kUm91dGUgPSBSb3V0ZXIuTm90Rm91bmRSb3V0ZTtcblxudmFyIHJvdXRlcyA9IChcbiAgPFJvdXRlIHBhdGg9XCIvXCIgaGFuZGxlcj17QXBwfT5cbiAgICA8RGVmYXVsdFJvdXRlIGhhbmRsZXI9e0hvbWV9IC8+XG4gICAgPE5vdEZvdW5kUm91dGUgaGFuZGxlcj17Tm90Rm91bmR9Lz5cbiAgICA8Um91dGUgcGF0aD1cInRhc2tzXCIgaGFuZGxlcj17VGFza1BhZ2V9IC8+XG4gICAgPFJvdXRlIHBhdGg9XCJhY3Rpdml0eVwiIGhhbmRsZXI9e0FjdGl2aXR5UGFnZX0gLz5cbiAgPC9Sb3V0ZT5cbik7XG5cbmV4cG9ydCBkZWZhdWx0IHJvdXRlcztcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7Um91dGVIYW5kbGVyfSBmcm9tICdyZWFjdC1yb3V0ZXInO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICB7LyogdGhpcyBpcyB0aGUgaW1wb3J0YW50IHBhcnQgKi99XG4gICAgICAgIDxSb3V0ZUhhbmRsZXIvPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFNpZ25VcCBmcm9tICcuL3NpZ24tdXAuanMnO1xuXG5leHBvcnQgZGVmYXVsdCBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cbiAgZ2V0SW5pdGlhbFN0YXRlKCkge1xuICAgIHJldHVybiB7XG4gICAgICBhdXRoZW50aWNhdGVkOiBQYXJzZS5Vc2VyLmN1cnJlbnQoKVxuICAgIH1cbiAgfSxcblxuICBjb25uZWN0RHJvcGJveCgpIHtcbiAgICBpZiAoIXRoaXMuc3RhdGUuYXV0aGVudGljYXRlZCkge1xuXG4gICAgfVxuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgbWFya3VwO1xuXG4gICAgaWYgKCF0aGlzLnN0YXRlLmF1dGhlbnRpY2F0ZWQpIHtcbiAgICAgIG1hcmt1cCA9IDxTaWduVXAvPjtcbiAgICB9IGVsc2Uge1xuICAgICAgbWFya3VwID0gKFxuICAgICAgICA8YnV0dG9uPlxuICAgICAgICAgIDxhIGhyZWY9XCIjL3Rhc2tzXCI+VGFza3M8L2E+XG4gICAgICAgIDwvYnV0dG9uPlxuICAgICAgKVxuICAgIH1cblxuICAgIHJldHVybiAoXG4gICAgICA8c2VjdGlvbiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlciBob21lXCI+XG4gICAgICAgIHttYXJrdXB9XG4gICAgICA8L3NlY3Rpb24+XG4gICAgKVxuICB9XG5cbn0pO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jbGFzcyBOb3RGb3VuZCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aDE+IFdoYXQgWW91IFRhbGtpbmcgQWJvdXQsIFdpbGxpcz88L2gxPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59XG5cblxuZXhwb3J0IGRlZmF1bHQgTm90Rm91bmQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNvbnN0IFNpZ25VcCA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxpbnB1dCB0eXBlPVwiZW1haWxcIiBwbGFjZWhvbGRlcj1cIiBFbWFpbCBBZGRyZXNzXCIgLz5cbiAgICAgICAgPGJ1dHRvbj4gU2lnbiBVcCA8L2J1dHRvbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IFNpZ25VcDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4uL2FwcC9kaXNwYXRjaGVyJztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGdldEluaXRpYWxTdGF0ZSguLi5wcm9wcykge1xuICAgIHJldHVybiB7fTtcbiAgfSxcblxuICBfb25DbGljayhoYXNodGFnKSB7XG4gICAgLy8gQ2hlY2sgaWYgaGFzaHRhZyBpcyBzYW1lIGFzIGN1cnJlbnRseSBzZWxlY3RlZFxuICAgIGxldCBpc1NlbGVjdGVkID0gdGhpcy5zdGF0ZS5zZWxlY3RlZCA9PT0gaGFzaHRhZztcblxuICAgIC8vIFNldCBzZWxlY3RlZCBoYXNodGFnIHRvIHN0YXRlXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHNlbGVjdGVkOiBoYXNodGFnIH0pO1xuXG4gICAgLy8gRGlzcGF0Y2ggc2VhcmNoIGJ5IGhhc2h0YWdcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6ICdzZWFyY2g6aGFzaHRhZycsXG4gICAgICBkYXRhOiBpc1NlbGVjdGVkID8gdW5kZWZpbmVkIDogaGFzaHRhZ1xuICAgIH0pO1xuICB9LFxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPHVsIGNsYXNzTmFtZT1cInRhc2staGFzaHRhZ3MtbGlzdFwiPlxuICAgICAgICB7dGhpcy5wcm9wcy5oYXNodGFncy5tYXAoKGhhc2hUYWcpID0+IHtcbiAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGxpIGtleT17aGFzaFRhZ31cbiAgICAgICAgICAgICAgICBjbGFzc05hbWU9e3tzZWxlY3RlZDogdGhpcy5zdGF0ZS5zZWxlY3RlZCA9PT0gaGFzaFRhZyB9fT5cbiAgICAgICAgICAgICAgPGEgb25DbGljaz17dGhpcy5fb25DbGljay5iaW5kKHRoaXMsIGhhc2hUYWcpfT5cbiAgICAgICAgICAgICAgICB7e2hhc2hUYWd9fVxuICAgICAgICAgICAgICA8L2E+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICk7XG4gICAgICAgIH0pfVxuICAgICAgPC91bD5cbiAgICApO1xuICB9XG5cbn0pO1xuXG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgVGFza0xpc3QgZnJvbSAnLi90YXNrLWxpc3QnO1xuaW1wb3J0IFRhc2tzIGZyb20gJy4vc3RvcmUnO1xuaW1wb3J0IFRhc2tGb3JtIGZyb20gJy4vdGFzay1mb3JtJztcbmltcG9ydCBIYXNodGFncyBmcm9tICcuL2hhc2h0YWdzJztcbmltcG9ydCBkaXNwYXRjaGVyIGZyb20gJy4uL2FwcC9kaXNwYXRjaGVyJztcblxuY2xhc3MgVGFza1BhZ2UgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHN1cGVyKCk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGxvYWRlZDogVGFza3MuX2lzTG9hZGVkLFxuICAgICAgdGFza3M6ICBUYXNrcy5faXNMb2FkZWQgPyBUYXNrcy50YXNrcyA6IFtdXG4gICAgfVxuICB9XG5cbiAgX29uQ2hhbmdlKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoeyB0YXNrczogVGFza1N0b3JlLmdldEFsbCgpIH0pO1xuICB9XG5cbiAgY29tcG9uZW50V2lsbE1vdW50KCkge1xuICAgIFRhc2tzLmNvbGxlY3Rpb24ubG9hZCgpXG4gICAgICAudGhlbigoY29sbGVjdGlvbikgPT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgbG9hZGVkOiB0cnVlLFxuICAgICAgICAgIHRhc2tzOiBjb2xsZWN0aW9uLm1vZGVsc1xuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICB9XG5cbiAgY29tcG9uZW50RGlkTW91bnQoKSB7XG4gICAgLy8gUmVnaXN0ZXIgd2l0aCBhcHAgZGlzcGF0Y2hlclxuICAgIHRoaXMudG9rZW4gPSBkaXNwYXRjaGVyLnJlZ2lzdGVyKChwYXlsb2FkKSA9PiB7XG4gICAgICBzd2l0Y2ggKHBheWxvYWQuYWN0aW9uVHlwZSkge1xuICAgICAgICBjYXNlICdzZWFyY2g6aGFzaHRhZyc6XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICB0YXNrczogVGFza3MuZ2V0QnlIYXNodGFnKHBheWxvYWQuZGF0YSlcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAndGFza3M6bG9hZCc6XG4gICAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgICBsb2FkZWQ6IHRydWUsXG4gICAgICAgICAgICB0YXNrczogVGFza3MudGFibGUucXVlcnkoKVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgLy8gV2F0Y2ggZm9yIGNoYW5nZXMgdG8gVGFza3NcbiAgICBUYXNrcy5jb2xsZWN0aW9uLm9uKCdjaGFuZ2UnLCB0aGlzLl9vbkNoYW5nZS5iaW5kKHRoaXMpKTtcbiAgfVxuXG4gIGNvbXBvbmVudFdpbGxVbm1vdW50KCkge1xuICAgIC8vIFVucmVnaXN0ZXIgZnJvbSBhcHAgZGlzcGF0Y2hlclxuICAgIGRpc3BhdGNoZXIudW5yZWdpc3Rlcih0aGlzLnRva2VuKTtcbiAgICAvLyBVbndhdGNoIGZvciBjaGFuZ2VzIHRvIFRhc2tzXG4gICAgVGFza3MuY29sbGVjdGlvbi5vbignY2hhbmdlJywgdGhpcy5fb25DaGFuZ2UuYmluZCh0aGlzKSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgbGV0IHRhc2tzID0gdGhpcy5zdGF0ZS50YXNrcztcblxuICAgIGxldCBoYXNodGFncyA9IHRoaXMuc3RhdGUubG9hZGVkID8gVGFza3MuY29sbGVjdGlvbi5nZXRIYXNodGFncygpIDogW107XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9XCJwYWdlXCI+XG4gICAgICAgIDxoNCBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPiBUYXNrcyA8L2g0PlxuICAgICAgICA8SGFzaHRhZ3MgaGFzaHRhZ3M9e2hhc2h0YWdzfS8+XG4gICAgICAgIDxUYXNrRm9ybSAvPlxuICAgICAgICB7dGhpcy5zdGF0ZS5sb2FkZWQgPyA8VGFza0xpc3QgdGFza3M9e3Rhc2tzfS8+IDogKFxuICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj5cbiAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLXNwaW5uZXIgZmEtc3BpbiBmYS0yeFwiPjwvaT5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgKX1cblxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IFRhc2tQYWdlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgZGlzcGF0Y2hlciBmcm9tICcuLi9hcHAvZGlzcGF0Y2hlci5qcyc7XG5pbXBvcnQgY29uc3RhbnRzIGZyb20gJy4uL2FwcC9jb25zdGFudHMuanMnO1xuaW1wb3J0IF8gZnJvbSAnbG9kYXNoJztcblxuLyoqXG4gKiBSZWZlcmVuY2UgdG8gdGhpcyBmaWxlJ3MgbW9kdWxlXG4gKiBAdHlwZSB7e319XG4gKi9cbmxldCBUYXNrcyA9IHt9O1xuXG4vKipcbiAqIFdoZXRoZXIgc3RvcmUgaGFzIGJlZW4gbG9hZGVkXG4gKiBAdHlwZSB7Ym9vbGVhbn1cbiAqIEBwcml2YXRlXG4gKi9cblRhc2tzLmlzTG9hZGVkID0gZmFsc2U7XG5cbi8qKlxuICogQ3VycmVudGx5IGxvZ2dlZCBpbiB1c2VyIGlmIGN1cnJlbnQgdXNlclxuICogQHR5cGUge29iamVjdH1cbiAqL1xuVGFza3MuY3VycmVudFVzZXIgPSBQYXJzZS5Vc2VyLmN1cnJlbnQoKTtcblxuY29uc3QgVGFza0NvbnN0YW50cyA9IGNvbnN0YW50cy5UQVNLUztcbmNvbnN0IENIQU5HRV9FVkVOVCA9ICdjaGFuZ2UnO1xuXG4vKipcbiAqIE1vZGVsIGZvciB0YXNrc1xuICovXG5jb25zdCBUYXNrID0gUGFyc2UuT2JqZWN0LmV4dGVuZCgnVGFza09iamVjdCcpO1xuXG4vKipcbiAqIENvbGxlY3Rpb24gZm9yIHRhc2tzc1xuICogQHR5cGUge1NlbGVjdGlvbi5leHRlbmR9XG4gKi9cbmxldCBUYXNrQ29sbGVjdGlvbiA9IFBhcnNlLkNvbGxlY3Rpb24uZXh0ZW5kKHtcblxuICAvLyBTZXQgbW9kZWwgb2YgY29sbGVjdGlvblxuICBtb2RlbDogVGFzayxcblxuICAvKipcbiAgICogVHJ1ZSBpZiBzdG9yZSBoYXMgYmVlbiBsb2FkZWQsIGZhbHNlIGlmIGl0IGhhcyBub3RcbiAgICogQHR5cGUge2Jvb2xlYW59XG4gICAqL1xuICBpc0xvYWRlZDogZmFsc2UsXG5cbiAgbG9hZCgpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcmV0dXJuIFRhc2tzLmNvbGxlY3Rpb24uZmV0Y2goe1xuICAgICAgICBzdWNjZXNzOiAoLi4uYXJncykgPT4ge1xuICAgICAgICAgIFRhc2tzLmlzTG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZSguLi5hcmdzKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXJyb3I6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gcmVqZWN0KC4uLmFyZ3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgdGFza1xuICAgKiBAcGFyYW0gIHtzdHJpbmd9IHRhc2tcbiAgICovXG4gICAgY3JlYXRlKHRhc2spIHtcbiAgICB0YXNrLmlkID0gKCtuZXcgRGF0ZSgpICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogOTk5OTk5KSkudG9TdHJpbmcoMzYpO1xuICAgIHRhc2suY29tcGxldGUgPSBmYWxzZTtcbiAgICB0YXNrLmhhc2h0YWdzID0gVGFza0NvbGxlY3Rpb24ucGFyc2VIYXNodGFncyh0YXNrLmRlc2NyaXB0aW9uKTtcbiAgICB0aGlzLnRhYmxlLmluc2VydCh0YXNrKTtcbiAgfSxcblxuICAvKipcbiAgICogVXBkYXRlIGEgVE9ETyBpdGVtLlxuICAgKiBAcGFyYW0gIHtzdHJpbmd9IGlkXG4gICAqIEBwYXJhbSB7b2JqZWN0fSB1cGRhdGVzIEFuIG9iamVjdCBsaXRlcmFsIGNvbnRhaW5pbmcgb25seSB0aGUgZGF0YSB0byBiZVxuICAgKiAgICAgdXBkYXRlZC5cbiAgICovXG4gICAgdXBkYXRlKGlkLCB1cGRhdGVzKSB7XG4gICAgdmFyIHRhc2sgPSB0aGlzLnRhYmxlLnF1ZXJ5KHsgaWQ6IGlkIH0pWzBdO1xuICAgIGlmICh0YXNrKSB7XG4gICAgICByZXR1cm4gT2JqZWN0LmtleXModXBkYXRlcykuZm9yRWFjaCgoa2V5KSA9PiB7XG4gICAgICAgIHJldHVybiB0YXNrLnNldChrZXksIHVwZGF0ZXNba2V5XSk7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGNvbnNvbGUud2FybihgVGFzayAke2lkfSBjb3VsZCBub3QgYmUgZm91bmRgKTtcbiAgICB9XG4gIH0sXG5cbiAgLyoqXG4gICAqIFVwZGF0ZSBhbGwgb2YgdGhlIFRPRE8gaXRlbXMgd2l0aCB0aGUgc2FtZSBvYmplY3QuXG4gICAqICAgICB0aGUgZGF0YSB0byBiZSB1cGRhdGVkLiAgVXNlZCB0byBtYXJrIGFsbCBUT0RPcyBhcyBjb21wbGV0ZWQuXG4gICAqIEBwYXJhbSAge29iamVjdH0gdXBkYXRlcyBBbiBvYmplY3QgbGl0ZXJhbCBjb250YWluaW5nIG9ubHkgdGhlIGRhdGEgdG8gYmVcbiAgICogICAgIHVwZGF0ZWQuXG4gICAqL1xuICAgIHVwZGF0ZUFsbCh1cGRhdGVzKSB7XG4gICAgbGV0IHRhc2tzID0gdGhpcy50YWJsZS5xdWVyeSgpO1xuICAgIHJldHVybiB0YXNrcy5mb3JFYWNoKGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgIFRhc2tDb2xsZWN0aW9uLnVwZGF0ZSh0YXNrLmdldCgnaWQnKSwgdXBkYXRlcyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhIFRPRE8gaXRlbS5cbiAgICogQHBhcmFtICB7c3RyaW5nfSBpZFxuICAgKi9cbiAgICBkZXN0cm95KGlkKSB7XG4gICAgZGVsZXRlIF90YXNrc1tpZF07XG4gIH0sXG5cbiAgLyoqXG4gICAqIERlbGV0ZSBhbGwgdGhlIGNvbXBsZXRlZCBUT0RPIGl0ZW1zLlxuICAgKi9cbiAgICBkZXN0cm95Q29tcGxldGVkKCkge1xuICAgIGZvciAodmFyIGlkIGluIF90YXNrcykge1xuICAgICAgaWYgKF90YXNrc1tpZF0uY29tcGxldGUpIHtcbiAgICAgICAgZGVzdHJveShpZCk7XG4gICAgICB9XG4gICAgfVxuICB9LFxuXG4gIC8qKlxuICAgKiBUZXN0cyB3aGV0aGVyIGFsbCB0aGUgcmVtYWluaW5nIFRPRE8gaXRlbXMgYXJlIG1hcmtlZCBhcyBjb21wbGV0ZWQuXG4gICAqIEByZXR1cm4ge2Jvb2xlYW59XG4gICAqL1xuICBhcmVBbGxDb21wbGV0ZTogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgaWQgaW4gX3Rhc2tzKSB7XG4gICAgICBpZiAoIV90YXNrc1tpZF0uY29tcGxldGUpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcblxuICAvKipcbiAgICogR2V0IHRoZSBlbnRpcmUgY29sbGVjdGlvbiBvZiBUT0RPcy5cbiAgICogQHJldHVybiB7b2JqZWN0fVxuICAgKi9cbiAgZ2V0QWxsOiBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZS5xdWVyeSgpO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2V0IHN0b3JlJ3MgcmVjb3JkcyBmaWx0ZXJlZCBvbiBwcm9wZXJ0eSBieSB2YWx1ZVxuICAgKiBAcGFyYW0gIHsqfSBwcm9wZXJ0eSBQcm9wZXJ0eSB0byBmaWx0ZXIgcmVjb3JkcyBvblxuICAgKiBAcGFyYW0gIHsqfSB2YWx1ZSAgICBWYWx1ZSB0byBmaWx0ZXIgZm9yXG4gICAqIEByZXR1cm4ge0FycmF5fVxuICAgKi9cbiAgICBnZXRCeShwcm9wZXJ0eSwgdmFsdWUsIG5vdCkge1xuICAgIGxldCB0YXNrcyA9IHRoaXMudGFibGUucXVlcnkoKTtcbiAgICBpZiAobm90KVxuICAgICAgcmV0dXJuIHRhc2tzLmZpbHRlcihyZWNvcmQgPT4gcmVjb3JkW3Byb3BlcnR5XSAhPT0gdmFsdWUpO1xuICAgIGVsc2VcbiAgICAgIHJldHVybiB0YXNrcy5maWx0ZXIocmVjb3JkID0+IHJlY29yZFtwcm9wZXJ0eV0gPT09IHZhbHVlKTtcbiAgfSxcblxuICBnZXRCeUhhc2h0YWcoaGFzaHRhZykge1xuICAgIHJldHVybiBUYXNrcy5jb2xsZWN0aW9uLm1vZGVscy5maWx0ZXIoZnVuY3Rpb24odGFzaykge1xuICAgICAgbGV0IHRhZ3MgPSB0YXNrLmdldCgnaGFzaHRhZ3MnKTtcbiAgICAgIHJldHVybiB0YWdzLmxlbmd0aCgpICYmIH50YWdzLnRvQXJyYXkoKS5pbmRleE9mKGhhc2h0YWcpO1xuICAgIH0pO1xuICB9LFxuXG4gIC8qKlxuICAgKiBAZGVzY3JpcHRpb24gR2V0IGhhc2h0YWdzIGZyb20gc3RvcmUncyByZWNvcmRzXG4gICAqIEByZXR1cm5zIHtBcnJheX1cbiAgICovXG4gICAgZ2V0SGFzaHRhZ3MoKSB7XG4gICAgcmV0dXJuIFRhc2tzLmNvbGxlY3Rpb24ubW9kZWxzXG4gICAgICAuZmlsdGVyKCh0YXNrKT0+IHtcbiAgICAgICAgcmV0dXJuIHRhc2suZ2V0KCdoYXNodGFncycpLmxlbmd0aDtcbiAgICAgIH0pXG4gICAgICAubWFwKCh0YXNrKSA9PiB0YXNrLmdldCgnaGFzaHRhZ3MnKSk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBkZXNjcmlwdGlvbiBHZXQgYXJyYXkgb2YgaGFzaHRhZ3MgZnJvbSB0ZXh0XG4gICAqIEBwYXJhbSAge1N0cmluZ30gdGV4dCBUZXh0IHRvIHNlYXJjaCBmb3IgaGFzaHRhZ3NcbiAgICogQHJldHVybiB7QXJyYXl9ICAgICAgTGlzdCBvZiBoYXNodGFnc1xuICAgKi9cbiAgICBwYXJzZUhhc2h0YWdzKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dC5tYXRjaCgvKCNbYS16XFxkXVtcXHctXSopL2lnKSB8fCBbXTtcbiAgfSxcblxuICBlbWl0Q2hhbmdlOiBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmVtaXQoQ0hBTkdFX0VWRU5UKTtcbiAgfSxcblxuICAvKipcbiAgICogQHBhcmFtIHtmdW5jdGlvbn0gY2FsbGJhY2tcbiAgICovXG4gIGFkZENoYW5nZUxpc3RlbmVyOiBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHRoaXMub24oQ0hBTkdFX0VWRU5ULCBjYWxsYmFjayk7XG4gIH0sXG5cbiAgLyoqXG4gICAqIEBwYXJhbSB7ZnVuY3Rpb259IGNhbGxiYWNrXG4gICAqL1xuICByZW1vdmVDaGFuZ2VMaXN0ZW5lcjogZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKENIQU5HRV9FVkVOVCwgY2FsbGJhY2spO1xuICB9XG59KTtcblxuLy8gQ2hlY2sgdXNlciBhdXRoZW50aWNhdGlvblxuaWYgKFRhc2tzLmN1cnJlbnRVc2VyKSB7XG4gIGNvbnNvbGUubG9nKFRhc2tzLmN1cnJlbnRVc2VyKTtcbn1cbmVsc2Uge1xuICBQYXJzZS5Vc2VyLmxvZ0luKHVzZXJuYW1lLCB7XG4gICAgc3VjY2VzczogKHVzZXIpID0+IHtcbiAgICAgIHRoaXMudW5kZWxlZ2F0ZUV2ZW50cygpO1xuICAgIH0sXG4gICAgZXJyb3I6ICh1c2VyLCBlcnJvcikgPT4ge1xuICAgICAgdGhpcy4kKFwiLmxvZ2luLWZvcm0gLmVycm9yXCIpLmh0bWwoXCJJbnZhbGlkIHVzZXJuYW1lIG9yIHBhc3N3b3JkLiBQbGVhc2UgdHJ5IGFnYWluLlwiKS5zaG93KCk7XG4gICAgICB0aGlzLiQoXCIubG9naW4tZm9ybSBidXR0b25cIikucmVtb3ZlQXR0cihcImRpc2FibGVkXCIpO1xuICAgIH1cbiAgfSk7XG59XG5cbi8vIFJlZ2lzdGVyIGNhbGxiYWNrIHRvIGhhbmRsZSBhbGwgdXBkYXRlc1xuZGlzcGF0Y2hlci5yZWdpc3RlcihmdW5jdGlvbihhY3Rpb24pIHtcbiAgbGV0IHRleHQ7XG5cbiAgc3dpdGNoKGFjdGlvbi5hY3Rpb25UeXBlKSB7XG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLkNSRUFURTpcbiAgICAgIGlmIChhY3Rpb24uZGF0YS5kZXNjcmlwdGlvbiAhPT0gJycpIHtcbiAgICAgICAgVGFza3MuY3JlYXRlKGFjdGlvbi5kYXRhKTtcbiAgICAgICAgVGFza3MuZW1pdENoYW5nZSgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuVE9HR0xFX0NPTVBMRVRFX0FMTDpcbiAgICAgIGlmIChUYXNrcy5hcmVBbGxDb21wbGV0ZSgpKSB7XG4gICAgICAgIFRhc2tzLnVwZGF0ZUFsbCh7Y29tcGxldGU6IGZhbHNlfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBUYXNrcy51cGRhdGVBbGwoe2NvbXBsZXRlOiB0cnVlfSk7XG4gICAgICB9XG4gICAgICBUYXNrcy5lbWl0Q2hhbmdlKCk7XG4gICAgICBicmVhaztcblxuICAgIGNhc2UgVGFza0NvbnN0YW50cy5VTkRPX0NPTVBMRVRFOlxuICAgICAgVGFza3MudXBkYXRlKGFjdGlvbi5pZCwge2NvbXBsZXRlOiBmYWxzZX0pO1xuICAgICAgVGFza3MuZW1pdENoYW5nZSgpO1xuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuQ09NUExFVEU6XG4gICAgICBUYXNrcy51cGRhdGUoYWN0aW9uLmlkLCB7Y29tcGxldGU6IHRydWV9KTtcbiAgICAgIFRhc2tzLmVtaXRDaGFuZ2UoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgY2FzZSBUYXNrQ29uc3RhbnRzLlVQREFURTpcbiAgICAgIHRleHQgPSBhY3Rpb24udGV4dC50cmltKCk7XG4gICAgICBpZiAodGV4dCAhPT0gJycpIHtcbiAgICAgICAgVGFza3MudXBkYXRlKGFjdGlvbi5pZCwge3RleHQ6IHRleHR9KTtcbiAgICAgICAgVGFza3MuZW1pdENoYW5nZSgpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG5cbiAgICBjYXNlIFRhc2tDb25zdGFudHMuREVTVFJPWTpcbiAgICAgIFRhc2tzLmRlc3Ryb3koYWN0aW9uLmlkKTtcbiAgICAgIFRhc2tzLmVtaXRDaGFuZ2UoKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgZGVmYXVsdDpcbiAgICAvLyBubyBvcFxuICB9XG59KTtcblxuVGFza3MubW9kZWwgPSBUYXNrO1xuXG5UYXNrcy5jb2xsZWN0aW9uID0gbmV3IFRhc2tDb2xsZWN0aW9uKCk7XG5cbmV4cG9ydCBkZWZhdWx0IFRhc2tzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IGRpc3BhdGNoZXIgZnJvbSAnLi4vYXBwL2Rpc3BhdGNoZXInO1xuaW1wb3J0IGNvbnN0YW50cyBmcm9tICcuLi9hcHAvY29uc3RhbnRzJztcblxuZXhwb3J0IGRlZmF1bHQgUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXG4gIGdldEluaXRpYWxTdGF0ZSgpIHtcbiAgICByZXR1cm4ge307XG4gIH0sXG5cbiAgLyoqXG4gICAqIEhhbmRsZSBmb3JtIHN1Ym1pc3Npb25cbiAgICogQHBhcmFtIHtTeW50aGV0aWNFdmVudH0gZXZlbnRcbiAgICovXG4gIG9uU3VibWl0KGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIEVtcHR5IGlucHV0IHZhbHVlXG4gICAgdGhpcy5zZXRTdGF0ZSh7IHZhbHVlOiAnJyB9KTtcblxuICAgIC8vIERpc3BhdGNoIHRhc2sgY3JlYXRpb24gZXZlbnRcbiAgICBkaXNwYXRjaGVyLmRpc3BhdGNoKHtcbiAgICAgIGFjdGlvblR5cGU6IGNvbnN0YW50cy5UQVNLUy5DUkVBVEUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGRlc2NyaXB0aW9uOiB0aGlzLnJlZnMubmFtZS5nZXRET01Ob2RlKCkudmFsdWVcbiAgICAgIH1cbiAgICB9KVxuICB9LFxuXG4gIC8qKlxuICAgKiBTZXQgdmFsdWUgb2YgaW5wdXQgZmllbGQgdG8gc3RhdGUudmFsdWUgb24gY2hhbmdlXG4gICAqL1xuICBvbkNoYW5nZSgpIHtcbiAgICB0aGlzLnNldFN0YXRlKHsgdmFsdWU6IHRoaXMucmVmcy5uYW1lLmdldERPTU5vZGUoKS52YWx1ZSB9KTtcbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImNhcmRcIj5cbiAgICAgICAgPGZvcm0gY2xhc3NOYW1lPVwidGFzay1mb3JtXCIgb25TdWJtaXQ9e3RoaXMub25TdWJtaXR9PlxuICAgICAgICAgIDxpbnB1dCBvbkNoYW5nZT17dGhpcy5vbkNoYW5nZX1cbiAgICAgICAgICAgICAgICAgcGxhY2Vob2xkZXI9XCJTZWFyY2ggdGFza3Mgb3IgY3JlYXRlIG5ldyB0YXNrXCJcbiAgICAgICAgICAgICAgICAgcmVmPVwibmFtZVwiXG4gICAgICAgICAgICAgICAgIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgIHR5cGU9XCJ0ZXh0XCJcbiAgICAgICAgICAgICAgICAgdmFsdWU9e3RoaXMuc3RhdGUudmFsdWV9Lz5cbiAgICAgICAgPC9mb3JtPlxuICAgICAgPC9zZWN0aW9uPlxuICAgICk7XG4gIH1cblxufSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmV4cG9ydCBkZWZhdWx0IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblxuICBvbkVkaXRDbGljaygpIHtcblxuICB9LFxuXG4gIG9uRGVsZXRlQ2xpY2soKSB7XG5cbiAgfSxcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDx1bCBjbGFzc05hbWU9XCJ0YXNrLWxpc3RcIj5cbiAgICAgICAge3RoaXMucHJvcHMudGFza3MubWFwKCh0YXNrKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDxsaSBrZXk9e3Rhc2suZ2V0KFwib2JqZWN0SWRcIil9IGNsYXNzTmFtZT1cInRhc2stbGlzdC1pdGVtIGNhcmRcIj5cbiAgICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJjaGVja2JveFwiIHZhbHVlPXt0YXNrLmNvbXBsZXRlZH0gLz5cbiAgICAgICAgICAgICAgPHNwYW4+e3Rhc2suZ2V0KFwidGl0bGVcIil9PC9zcGFuPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cInB1bGwtcmlnaHRcIj5cbiAgICAgICAgICAgICAgICA8aSBjbGFzc05hbWU9XCJmYSBmYS1lZGl0XCIgb25DbGljaz17dGhpcy5vbkVkaXRDbGlja30+PC9pPlxuICAgICAgICAgICAgICAgIDxpIGNsYXNzTmFtZT1cImZhIGZhLWNsb3NlXCIgb25DbGljaz17dGhpcy5vbkRlbGV0ZUNsaWNrfT48L2k+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICApO1xuICAgICAgICB9KX1cbiAgICAgIDwvdWw+XG4gICAgKTtcbiAgfVxuXG59KTtcbiJdfQ==
