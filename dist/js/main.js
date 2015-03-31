(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

// Require application
require("./app");

},{"./app":3}],2:[function(require,module,exports){
"use strict";

var Dispatcher = require("flux").Dispatcher;

module.exports = new Dispatcher();

},{"flux":"flux"}],3:[function(require,module,exports){
"use strict";

var App = {

  dispatcher: require("./dispatcher"),

  router: require("./router.jsx")

};

module.exports = App;

},{"./dispatcher":2,"./router.jsx":4}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

// Components

var App = _interopRequire(require("../components/app.jsx"));

var Home = _interopRequire(require("../components/home.jsx"));

var About = _interopRequire(require("../components/about.jsx"));

var GettingStarted = _interopRequire(require("../components/getting-started.jsx"));

var BuiltIn = _interopRequire(require("../components/built-in.jsx"));

var NotFound = _interopRequire(require("../components/not-found"));

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
  React.createElement(Route, { path: "/about", name: "about", handler: About }),
  React.createElement(Route, { path: "/get-started", name: "get-started", handler: GettingStarted }),
  React.createElement(Route, { path: "/built-in", name: "built-in", handler: BuiltIn })
);

Router.run(routes, function (Handler) {
  React.render(React.createElement(Handler, null), document.querySelector("body"));
});

// Or, if you'd like to use the HTML5 history API for cleaner URLs:
// Router.run(routes, Router.HistoryLocation, function (Handler) {
//   React.render(<Handler/>, document.querySelector('app'));
// });

},{"../components/about.jsx":5,"../components/app.jsx":6,"../components/built-in.jsx":7,"../components/getting-started.jsx":8,"../components/home.jsx":9,"../components/not-found":10,"react":"react","react-router":"react-router"}],5:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var About = (function (_React$Component) {
  function About() {
    _classCallCheck(this, About);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(About, _React$Component);

  _createClass(About, {
    render: {
      value: function render() {
        return React.createElement(
          "div",
          { id: "about" },
          React.createElement(
            "h3",
            null,
            " About "
          ),
          React.createElement(
            "section",
            { className: "card" },
            React.createElement(
              "p",
              null,
              "This is a starter kit for getting ReactJS client-side up and running. It follows the best practices endorsed by the ReactJS team and the leading developers in the ReactJS community."
            )
          )
        );
      }
    }
  });

  return About;
})(React.Component);

module.exports = About;

},{"react":"react"}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var classnames = _interopRequire(require("classnames"));

var React = _interopRequire(require("react"));

var RouteHandler = require("react-router").RouteHandler;

var App = (function (_React$Component) {
  function App() {
    _classCallCheck(this, App);

    this.state = {
      open: false
    };
  }

  _inherits(App, _React$Component);

  _createClass(App, {
    onClick: {

      /**
       * Handle click event
       * @param {string} source
       * @param {SyntheticEvent} event
       */

      value: function onClick(source, event) {
        // Always close nav drawer if main was clicked
        if (source === "main") this.setState({ open: false });
        // Otherwise toggle open
        else this.setState({ open: !this.state.open });
      }
    },
    render: {
      value: function render() {
        var open = { open: this.state.open };
        return React.createElement(
          "div",
          null,
          React.createElement(
            "header",
            { className: "site-header ui-blue" },
            React.createElement(
              "div",
              {
                className: classnames("hamburger menu", open),
                href: "#",
                onClick: this.onClick.bind(this, "icon") },
              React.createElement("i", null)
            ),
            React.createElement(
              "div",
              { className: "logo" },
              "Facade-React"
            )
          ),
          React.createElement(
            "nav",
            { className: classnames("site-nav ui-blue", open), onClick: this.onClick.bind(this, "nav") },
            React.createElement(
              "ul",
              null,
              React.createElement(
                "li",
                null,
                React.createElement(
                  "a",
                  { href: "#/about" },
                  " About "
                )
              ),
              React.createElement(
                "li",
                null,
                React.createElement(
                  "a",
                  { href: "#/get-started" },
                  " Get Started "
                )
              ),
              React.createElement(
                "li",
                null,
                React.createElement(
                  "a",
                  { href: "#/built-in" },
                  " Built-in "
                )
              ),
              React.createElement(
                "li",
                null,
                React.createElement(
                  "a",
                  { href: "https://github.com/theponti/facade-react" },
                  " Code "
                )
              )
            )
          ),
          React.createElement(
            "main",
            { className: classnames(open), onClick: this.onClick.bind(this, "main") },
            React.createElement(RouteHandler, null)
          )
        );
      }
    }
  });

  return App;
})(React.Component);

module.exports = App;
/* this is the important part */

},{"classnames":"classnames","react":"react","react-router":"react-router"}],7:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var BuiltIn = (function (_React$Component) {
  function BuiltIn() {
    _classCallCheck(this, BuiltIn);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
  }

  _inherits(BuiltIn, _React$Component);

  _createClass(BuiltIn, {
    render: {
      value: function render() {
        return React.createElement(
          "div",
          { id: "built-in" },
          React.createElement(
            "h3",
            null,
            " Built-in "
          ),
          React.createElement(
            "section",
            { className: "card" },
            React.createElement(
              "ul",
              null,
              React.createElement(
                "li",
                null,
                React.createElement(
                  "b",
                  null,
                  "React (v0.13.1) & React-Router (v0.13.2)"
                )
              ),
              React.createElement(
                "li",
                null,
                React.createElement(
                  "b",
                  null,
                  "Browserify & Babel"
                )
              ),
              React.createElement(
                "li",
                null,
                React.createElement(
                  "b",
                  null,
                  "Karma"
                ),
                " & ",
                React.createElement(
                  "b",
                  null,
                  "Jasmine"
                )
              ),
              React.createElement(
                "li",
                null,
                React.createElement(
                  "b",
                  null,
                  "SASS"
                ),
                " w/ ",
                React.createElement(
                  "b",
                  null,
                  "Autoprefixer"
                ),
                " & ",
                React.createElement(
                  "b",
                  null,
                  "CSSO"
                )
              ),
              React.createElement(
                "li",
                null,
                React.createElement(
                  "b",
                  null,
                  "Browser-Sync"
                )
              ),
              React.createElement(
                "li",
                null,
                React.createElement(
                  "b",
                  null,
                  "Gulp"
                )
              )
            )
          )
        );
      }
    }
  });

  return BuiltIn;
})(React.Component);

module.exports = BuiltIn;

},{"react":"react"}],8:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var GettingStarted = (function (_React$Component) {
    function GettingStarted() {
        _classCallCheck(this, GettingStarted);

        if (_React$Component != null) {
            _React$Component.apply(this, arguments);
        }
    }

    _inherits(GettingStarted, _React$Component);

    _createClass(GettingStarted, {
        render: {
            value: function render() {
                return React.createElement(
                    "div",
                    { id: "get-started" },
                    React.createElement(
                        "h3",
                        null,
                        " Getting Started "
                    ),
                    React.createElement(
                        "section",
                        { className: "card" },
                        React.createElement(
                            "ol",
                            null,
                            React.createElement(
                                "li",
                                null,
                                "Clone ",
                                React.createElement(
                                    "a",
                                    { href: "https://github.com/theponti/facade-react" },
                                    "repo"
                                )
                            ),
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "code",
                                    null,
                                    " npm install "
                                )
                            ),
                            React.createElement(
                                "li",
                                null,
                                React.createElement(
                                    "code",
                                    null,
                                    " npm start "
                                )
                            ),
                            React.createElement(
                                "li",
                                null,
                                "Start coding"
                            )
                        )
                    )
                );
            }
        }
    });

    return GettingStarted;
})(React.Component);

module.exports = GettingStarted;

},{"react":"react"}],9:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var Home = (function (_React$Component) {
  function Home() {
    _classCallCheck(this, Home);

    if (_React$Component != null) {
      _React$Component.apply(this, arguments);
    }
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
            " Facade React "
          ),
          React.createElement("div", { className: "container", id: "app" })
        );
      }
    }
  });

  return Home;
})(React.Component);

module.exports = Home;

},{"react":"react"}],10:[function(require,module,exports){
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

},{"react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC1ib2lsZXJwbGF0ZS9zcmMvanMvbWFpbi5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0LWJvaWxlcnBsYXRlL3NyYy9qcy9hcHAvZGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0LWJvaWxlcnBsYXRlL3NyYy9qcy9hcHAvaW5kZXguanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC1ib2lsZXJwbGF0ZS9zcmMvanMvYXBwL3JvdXRlci5qc3giLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC1ib2lsZXJwbGF0ZS9zcmMvanMvY29tcG9uZW50cy9hYm91dC5qc3giLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC1ib2lsZXJwbGF0ZS9zcmMvanMvY29tcG9uZW50cy9hcHAuanN4IiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3QtYm9pbGVycGxhdGUvc3JjL2pzL2NvbXBvbmVudHMvYnVpbHQtaW4uanN4IiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3QtYm9pbGVycGxhdGUvc3JjL2pzL2NvbXBvbmVudHMvZ2V0dGluZy1zdGFydGVkLmpzeCIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0LWJvaWxlcnBsYXRlL3NyYy9qcy9jb21wb25lbnRzL2hvbWUuanN4IiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3QtYm9pbGVycGxhdGUvc3JjL2pzL2NvbXBvbmVudHMvbm90LWZvdW5kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsWUFBWSxDQUFDOzs7QUFH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Z0NBQ1U7O3NDQUFHLElBQUksRUFBQywwQ0FBMEM7O2lDQUFTOzZCQUNoRTs0QkFDTDs7O2dDQUNJOzs7O2lDQUEwQjs2QkFDekI7NEJBQ0w7OztnQ0FDSTs7OztpQ0FBd0I7NkJBQ3ZCOzRCQUNMOzs7OzZCQUVLO3lCQUNKO3FCQUNDO2lCQUNSLENBQ047YUFDSDs7OztXQXhCRyxjQUFjO0dBQVMsS0FBSyxDQUFDLFNBQVM7O2lCQTRCN0IsY0FBYzs7O0FDaEM3QixZQUFZLENBQUM7Ozs7Ozs7Ozs7SUFFTixLQUFLLDJCQUFNLE9BQU87O0lBR25CLElBQUk7V0FBSixJQUFJOzBCQUFKLElBQUk7Ozs7Ozs7WUFBSixJQUFJOztlQUFKLElBQUk7QUFFUixVQUFNO2FBQUEsa0JBQUc7QUFDUCxlQUNFOzs7VUFDRTs7Y0FBSSxTQUFTLEVBQUMsYUFBYTs7V0FBb0I7VUFDL0MsNkJBQUssU0FBUyxFQUFDLFdBQVcsRUFBQyxFQUFFLEVBQUMsS0FBSyxHQUFPO1NBQ3RDLENBQ1A7T0FDRjs7OztTQVRHLElBQUk7R0FBUyxLQUFLLENBQUMsU0FBUzs7aUJBYW5CLElBQUk7OztBQ2xCbkIsWUFBWSxDQUFDOzs7Ozs7Ozs7O0lBRU4sS0FBSywyQkFBTSxPQUFPOztJQUVuQixRQUFRO1dBQVIsUUFBUTswQkFBUixRQUFROzs7Ozs7O1lBQVIsUUFBUTs7ZUFBUixRQUFRO0FBRVosVUFBTTthQUFBLGtCQUFHO0FBQ1AsZUFDRTs7O1VBQ0U7Ozs7V0FBeUM7U0FDckMsQ0FDTjtPQUNIOzs7O1NBUkcsUUFBUTtHQUFTLEtBQUssQ0FBQyxTQUFTOztpQkFhdkIsUUFBUSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbi8vIFJlcXVpcmUgYXBwbGljYXRpb25cbnJlcXVpcmUoJy4vYXBwJyk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCB7RGlzcGF0Y2hlcn0gZnJvbSAnZmx1eCc7XG5cbm1vZHVsZS5leHBvcnRzID0gbmV3IERpc3BhdGNoZXIoKTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIEFwcCA9IHtcblxuICBkaXNwYXRjaGVyOiByZXF1aXJlKCcuL2Rpc3BhdGNoZXInKSxcblxuICByb3V0ZXI6IHJlcXVpcmUoJy4vcm91dGVyLmpzeCcpXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQXBwO1xuIiwiJ3VzZSBzdHJpY3QnXG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBBcHAgZnJvbSAnLi4vY29tcG9uZW50cy9hcHAuanN4JztcbmltcG9ydCBIb21lIGZyb20gJy4uL2NvbXBvbmVudHMvaG9tZS5qc3gnO1xuaW1wb3J0IEFib3V0IGZyb20gJy4uL2NvbXBvbmVudHMvYWJvdXQuanN4JztcbmltcG9ydCBHZXR0aW5nU3RhcnRlZCBmcm9tICcuLi9jb21wb25lbnRzL2dldHRpbmctc3RhcnRlZC5qc3gnO1xuaW1wb3J0IEJ1aWx0SW4gZnJvbSAnLi4vY29tcG9uZW50cy9idWlsdC1pbi5qc3gnO1xuaW1wb3J0IE5vdEZvdW5kIGZyb20gJy4uL2NvbXBvbmVudHMvbm90LWZvdW5kJztcblxuLy8gRGVwZW5kZW5jaWVzXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJvdXRlciBmcm9tICdyZWFjdC1yb3V0ZXInO1xuXG5sZXQgUm91dGUgID0gUm91dGVyLlJvdXRlO1xubGV0IERlZmF1bHRSb3V0ZSA9IFJvdXRlci5EZWZhdWx0Um91dGU7XG5sZXQgTm90Rm91bmRSb3V0ZSA9IFJvdXRlci5Ob3RGb3VuZFJvdXRlO1xuXG52YXIgcm91dGVzID0gKFxuICA8Um91dGUgcGF0aD1cIi9cIiBoYW5kbGVyPXtBcHB9PlxuICAgIDxEZWZhdWx0Um91dGUgaGFuZGxlcj17SG9tZX0gLz5cbiAgICA8Tm90Rm91bmRSb3V0ZSBoYW5kbGVyPXtOb3RGb3VuZH0vPlxuICAgIDxSb3V0ZSBwYXRoPVwiL2Fib3V0XCIgbmFtZT1cImFib3V0XCIgaGFuZGxlcj17QWJvdXR9IC8+XG4gICAgPFJvdXRlIHBhdGg9XCIvZ2V0LXN0YXJ0ZWRcIiBuYW1lPVwiZ2V0LXN0YXJ0ZWRcIiBoYW5kbGVyPXtHZXR0aW5nU3RhcnRlZH0gLz5cbiAgICA8Um91dGUgcGF0aD1cIi9idWlsdC1pblwiIG5hbWU9XCJidWlsdC1pblwiIGhhbmRsZXI9e0J1aWx0SW59IC8+XG4gIDwvUm91dGU+XG4pO1xuXG5Sb3V0ZXIucnVuKHJvdXRlcywgZnVuY3Rpb24gKEhhbmRsZXIpIHtcbiAgUmVhY3QucmVuZGVyKDxIYW5kbGVyLz4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSk7XG59KTtcblxuLy8gT3IsIGlmIHlvdSdkIGxpa2UgdG8gdXNlIHRoZSBIVE1MNSBoaXN0b3J5IEFQSSBmb3IgY2xlYW5lciBVUkxzOlxuLy8gUm91dGVyLnJ1bihyb3V0ZXMsIFJvdXRlci5IaXN0b3J5TG9jYXRpb24sIGZ1bmN0aW9uIChIYW5kbGVyKSB7XG4vLyAgIFJlYWN0LnJlbmRlcig8SGFuZGxlci8+LCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhcHAnKSk7XG4vLyB9KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY2xhc3MgQWJvdXQgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBpZD1cImFib3V0XCI+XG4gICAgICAgIDxoMz4gQWJvdXQgPC9oMz5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiY2FyZFwiPlxuICAgICAgICAgICAgPHA+XG4gICAgICAgICAgICAgICAgVGhpcyBpcyBhIHN0YXJ0ZXIga2l0IGZvciBnZXR0aW5nIFJlYWN0SlMgY2xpZW50LXNpZGUgdXAgYW5kXG4gICAgICAgICAgICAgICAgcnVubmluZy4gSXQgZm9sbG93cyB0aGUgYmVzdCBwcmFjdGljZXMgZW5kb3JzZWQgYnkgdGhlIFJlYWN0SlNcbiAgICAgICAgICAgICAgICB0ZWFtIGFuZCB0aGUgbGVhZGluZyBkZXZlbG9wZXJzIGluIHRoZSBSZWFjdEpTIGNvbW11bml0eS5cbiAgICAgICAgICAgIDwvcD5cbiAgICAgICAgPC9zZWN0aW9uPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IEFib3V0O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgY2xhc3NuYW1lcyBmcm9tICdjbGFzc25hbWVzJztcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQge1JvdXRlSGFuZGxlcn0gZnJvbSAncmVhY3Qtcm91dGVyJztcblxuY2xhc3MgQXBwIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgb3BlbjogZmFsc2VcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBjbGljayBldmVudFxuICAgKiBAcGFyYW0ge3N0cmluZ30gc291cmNlXG4gICAqIEBwYXJhbSB7U3ludGhldGljRXZlbnR9IGV2ZW50XG4gICAqL1xuICBvbkNsaWNrKHNvdXJjZSwgZXZlbnQpIHtcbiAgICAvLyBBbHdheXMgY2xvc2UgbmF2IGRyYXdlciBpZiBtYWluIHdhcyBjbGlja2VkXG4gICAgaWYgKHNvdXJjZSA9PT0gJ21haW4nKVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG9wZW46IGZhbHNlIH0pO1xuICAgIC8vIE90aGVyd2lzZSB0b2dnbGUgb3BlblxuICAgIGVsc2VcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBvcGVuOiAhdGhpcy5zdGF0ZS5vcGVuIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIGxldCBvcGVuID0geyBvcGVuOiB0aGlzLnN0YXRlLm9wZW4gfTtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGhlYWRlciBjbGFzc05hbWU9XCJzaXRlLWhlYWRlciB1aS1ibHVlXCI+XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhcImhhbWJ1cmdlciBtZW51XCIsIG9wZW4pfVxuICAgICAgICAgICAgICBocmVmPVwiI1wiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DbGljay5iaW5kKHRoaXMsICdpY29uJyl9PlxuICAgICAgICAgICAgICA8aT48L2k+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibG9nb1wiPkZhY2FkZS1SZWFjdDwvZGl2PlxuICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgPG5hdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoJ3NpdGUtbmF2IHVpLWJsdWUnLCBvcGVuKX0gb25DbGljaz17dGhpcy5vbkNsaWNrLmJpbmQodGhpcywgJ25hdicpfT5cbiAgICAgICAgICA8dWw+XG4gICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgIDxhIGhyZWY9XCIjL2Fib3V0XCI+IEFib3V0IDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgIDxhIGhyZWY9XCIjL2dldC1zdGFydGVkXCI+IEdldCBTdGFydGVkIDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgIDxhIGhyZWY9XCIjL2J1aWx0LWluXCI+IEJ1aWx0LWluIDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vdGhlcG9udGkvZmFjYWRlLXJlYWN0XCI+IENvZGUgPC9hPlxuICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICA8L3VsPlxuICAgICAgICA8L25hdj5cbiAgICAgICAgPG1haW4gY2xhc3NOYW1lPXtjbGFzc25hbWVzKG9wZW4pfSBvbkNsaWNrPXt0aGlzLm9uQ2xpY2suYmluZCh0aGlzLCAnbWFpbicpfT5cbiAgICAgICAgICAgIHsvKiB0aGlzIGlzIHRoZSBpbXBvcnRhbnQgcGFydCAqL31cbiAgICAgICAgICAgIDxSb3V0ZUhhbmRsZXIvPlxuICAgICAgICA8L21haW4+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBBcHA7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNsYXNzIEJ1aWx0SW4gZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBpZD1cImJ1aWx0LWluXCI+XG4gICAgICAgIDxoMz4gQnVpbHQtaW4gPC9oMz5cbiAgICAgICAgPHNlY3Rpb24gY2xhc3NOYW1lPVwiY2FyZFwiPlxuICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgPGI+UmVhY3QgKHYwLjEzLjEpICYgUmVhY3QtUm91dGVyICh2MC4xMy4yKTwvYj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgIDxiPkJyb3dzZXJpZnkgJiBCYWJlbDwvYj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgIDxiPkthcm1hPC9iPiAmIDxiPkphc21pbmU8L2I+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICA8Yj5TQVNTPC9iPiB3LyA8Yj5BdXRvcHJlZml4ZXI8L2I+ICYgPGI+Q1NTTzwvYj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgIDxiPkJyb3dzZXItU3luYzwvYj5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgIDxiPkd1bHA8L2I+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvc2VjdGlvbj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBCdWlsdEluO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jbGFzcyBHZXR0aW5nU3RhcnRlZCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGlkPVwiZ2V0LXN0YXJ0ZWRcIj5cbiAgICAgICAgICA8aDM+IEdldHRpbmcgU3RhcnRlZCA8L2gzPlxuICAgICAgICAgIDxzZWN0aW9uIGNsYXNzTmFtZT1cImNhcmRcIj5cbiAgICAgICAgICAgICAgPG9sPlxuICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgIENsb25lIDxhIGhyZWY9XCJodHRwczovL2dpdGh1Yi5jb20vdGhlcG9udGkvZmFjYWRlLXJlYWN0XCI+cmVwbzwvYT5cbiAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgPGNvZGU+IG5wbSBpbnN0YWxsIDwvY29kZT5cbiAgICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICAgICAgICA8bGk+XG4gICAgICAgICAgICAgICAgICAgICAgPGNvZGU+IG5wbSBzdGFydCA8L2NvZGU+XG4gICAgICAgICAgICAgICAgICA8L2xpPlxuICAgICAgICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICAgICAgICAgIFN0YXJ0IGNvZGluZ1xuICAgICAgICAgICAgICAgICAgPC9saT5cbiAgICAgICAgICAgICAgPC9vbD5cbiAgICAgICAgICA8L3NlY3Rpb24+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgR2V0dGluZ1N0YXJ0ZWQ7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cblxuY2xhc3MgSG9tZSBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aDIgY2xhc3NOYW1lPVwidGV4dC1jZW50ZXJcIj4gRmFjYWRlIFJlYWN0IDwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCIgaWQ9XCJhcHBcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IEhvbWU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNsYXNzIE5vdEZvdW5kIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoMT4gV2hhdCBZb3UgVGFsa2luZyBBYm91dCwgV2lsbGlzPzwvaDE+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBOb3RGb3VuZDtcbiJdfQ==
