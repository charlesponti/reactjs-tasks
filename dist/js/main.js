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
  React.createElement(NotFoundRoute, { handler: NotFound })
);

Router.run(routes, function (Handler) {
  React.render(React.createElement(Handler, null), document.querySelector("body"));
});

// Or, if you'd like to use the HTML5 history API for cleaner URLs:
// Router.run(routes, Router.HistoryLocation, function (Handler) {
//   React.render(<Handler/>, document.querySelector('app'));
// });

},{"../components/app.jsx":5,"../components/home.jsx":6,"../components/not-found":7,"react":"react","react-router":"react-router"}],5:[function(require,module,exports){
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
            { className: "site ui-blue" },
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
              "React Boilerplate"
            )
          ),
          React.createElement(
            "nav",
            { className: classnames("site ui-blue", open), onClick: this.onClick.bind(this, "nav") },
            React.createElement(
              "ul",
              null,
              React.createElement(
                "li",
                null,
                React.createElement(
                  "a",
                  { href: "#" },
                  " Link "
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

},{"classnames":"classnames","react":"react","react-router":"react-router"}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var TextField = _interopRequire(require("../fields/text-field"));

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
            " React Boilerplate "
          ),
          React.createElement(
            "div",
            { className: "container", id: "app" },
            React.createElement(TextField, null)
          )
        );
      }
    }
  });

  return Home;
})(React.Component);

module.exports = Home;

},{"../fields/text-field":8,"react":"react"}],7:[function(require,module,exports){
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

},{"react":"react"}],8:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var React = _interopRequire(require("react"));

var TextField = (function (_React$Component) {
  function TextField() {
    _classCallCheck(this, TextField);

    this.state = {
      read: true,
      value: "foo bar"
    };
  }

  _inherits(TextField, _React$Component);

  _createClass(TextField, {
    onClick: {
      value: function onClick() {
        this.setState({ read: !this.state.read });
      }
    },
    render: {
      value: function render() {
        var input = React.createElement("input", { type: "text", value: this.state.value });
        var span = React.createElement(
          "span",
          null,
          this.state.value
        );
        return React.createElement(
          "div",
          { onClick: this.onClick.bind(this) },
          this.state.read ? span : input
        );
      }
    }
  });

  return TextField;
})(React.Component);

module.exports = TextField;

},{"react":"react"}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC10YXNrcy9zcmMvanMvbWFpbi5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0LXRhc2tzL3NyYy9qcy9hcHAvZGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0LXRhc2tzL3NyYy9qcy9hcHAvaW5kZXguanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC10YXNrcy9zcmMvanMvYXBwL3JvdXRlci5qc3giLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC10YXNrcy9zcmMvanMvY29tcG9uZW50cy9hcHAuanN4IiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3QtdGFza3Mvc3JjL2pzL2NvbXBvbmVudHMvaG9tZS5qc3giLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC10YXNrcy9zcmMvanMvY29tcG9uZW50cy9ub3QtZm91bmQuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC10YXNrcy9zcmMvanMvZmllbGRzL3RleHQtZmllbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7UUFHTixPQUFPOzs7QUNIZCxZQUFZLENBQUM7O0lBRUwsVUFBVSxXQUFPLE1BQU0sRUFBdkIsVUFBVTs7QUFFbEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOzs7QUNKbEMsWUFBWSxDQUFDOztBQUViLElBQUksR0FBRyxHQUFHOztBQUVSLFlBQVUsRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDOztBQUVuQyxRQUFNLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQzs7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RUFBRSxDQUFDLENBQUM7T0FDM0M7O0FBRUQsVUFBTTthQUFBLGtCQUFHO0FBQ1AsWUFBSSxLQUFLLEdBQUcsK0JBQU8sSUFBSSxFQUFDLE1BQU0sRUFBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEFBQUMsR0FBRSxDQUFDO0FBQzFELFlBQUksSUFBSSxHQUFHOzs7VUFBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUs7U0FBUSxDQUFDO0FBQzNDLGVBQ0U7O1lBQUssT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxBQUFDO1VBQ25DLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLElBQUksR0FBRyxLQUFLO1NBQzNCLENBQ047T0FDSDs7OztTQXJCRyxTQUFTO0dBQVMsS0FBSyxDQUFDLFNBQVM7O2lCQXdCeEIsU0FBUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbi8vIFJlcXVpcmUgYXBwbGljYXRpb25cbmltcG9ydCAnLi9hcHAnO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQge0Rpc3BhdGNoZXJ9IGZyb20gJ2ZsdXgnO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5ldyBEaXNwYXRjaGVyKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBBcHAgPSB7XG5cbiAgZGlzcGF0Y2hlcjogcmVxdWlyZSgnLi9kaXNwYXRjaGVyJyksXG5cbiAgcm91dGVyOiByZXF1aXJlKCcuL3JvdXRlci5qc3gnKVxuXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEFwcDtcbiIsIid1c2Ugc3RyaWN0JztcblxuLy8gQ29tcG9uZW50c1xuaW1wb3J0IEFwcCBmcm9tICcuLi9jb21wb25lbnRzL2FwcC5qc3gnO1xuaW1wb3J0IEhvbWUgZnJvbSAnLi4vY29tcG9uZW50cy9ob21lLmpzeCc7XG5pbXBvcnQgTm90Rm91bmQgZnJvbSAnLi4vY29tcG9uZW50cy9ub3QtZm91bmQnO1xuXG4vLyBEZXBlbmRlbmNpZXNcbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5pbXBvcnQgUm91dGVyIGZyb20gJ3JlYWN0LXJvdXRlcic7XG5cbmxldCBSb3V0ZSAgPSBSb3V0ZXIuUm91dGU7XG5sZXQgRGVmYXVsdFJvdXRlID0gUm91dGVyLkRlZmF1bHRSb3V0ZTtcbmxldCBOb3RGb3VuZFJvdXRlID0gUm91dGVyLk5vdEZvdW5kUm91dGU7XG5cbnZhciByb3V0ZXMgPSAoXG4gIDxSb3V0ZSBwYXRoPVwiL1wiIGhhbmRsZXI9e0FwcH0+XG4gICAgPERlZmF1bHRSb3V0ZSBoYW5kbGVyPXtIb21lfSAvPlxuICAgIDxOb3RGb3VuZFJvdXRlIGhhbmRsZXI9e05vdEZvdW5kfS8+XG4gIDwvUm91dGU+XG4pO1xuXG5Sb3V0ZXIucnVuKHJvdXRlcywgZnVuY3Rpb24gKEhhbmRsZXIpIHtcbiAgUmVhY3QucmVuZGVyKDxIYW5kbGVyLz4sIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSk7XG59KTtcblxuLy8gT3IsIGlmIHlvdSdkIGxpa2UgdG8gdXNlIHRoZSBIVE1MNSBoaXN0b3J5IEFQSSBmb3IgY2xlYW5lciBVUkxzOlxuLy8gUm91dGVyLnJ1bihyb3V0ZXMsIFJvdXRlci5IaXN0b3J5TG9jYXRpb24sIGZ1bmN0aW9uIChIYW5kbGVyKSB7XG4vLyAgIFJlYWN0LnJlbmRlcig8SGFuZGxlci8+LCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhcHAnKSk7XG4vLyB9KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IGNsYXNzbmFtZXMgZnJvbSAnY2xhc3NuYW1lcyc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IHtSb3V0ZUhhbmRsZXJ9IGZyb20gJ3JlYWN0LXJvdXRlcic7XG5cbmNsYXNzIEFwcCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIG9wZW46IGZhbHNlXG4gICAgfTtcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGUgY2xpY2sgZXZlbnRcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNvdXJjZVxuICAgKiBAcGFyYW0ge1N5bnRoZXRpY0V2ZW50fSBldmVudFxuICAgKi9cbiAgb25DbGljayhzb3VyY2UsIGV2ZW50KSB7XG4gICAgLy8gQWx3YXlzIGNsb3NlIG5hdiBkcmF3ZXIgaWYgbWFpbiB3YXMgY2xpY2tlZFxuICAgIGlmIChzb3VyY2UgPT09ICdtYWluJylcbiAgICAgIHRoaXMuc2V0U3RhdGUoeyBvcGVuOiBmYWxzZSB9KTtcbiAgICAvLyBPdGhlcndpc2UgdG9nZ2xlIG9wZW5cbiAgICBlbHNlXG4gICAgICB0aGlzLnNldFN0YXRlKHsgb3BlbjogIXRoaXMuc3RhdGUub3BlbiB9KTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICBsZXQgb3BlbiA9IHsgb3BlbjogdGhpcy5zdGF0ZS5vcGVuIH07XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoZWFkZXIgY2xhc3NOYW1lPVwic2l0ZSB1aS1ibHVlXCI+XG4gICAgICAgICAgICA8ZGl2XG4gICAgICAgICAgICAgIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhcImhhbWJ1cmdlciBtZW51XCIsIG9wZW4pfVxuICAgICAgICAgICAgICBocmVmPVwiI1wiXG4gICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMub25DbGljay5iaW5kKHRoaXMsICdpY29uJyl9PlxuICAgICAgICAgICAgICA8aT48L2k+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgIDxkaXYgY2xhc3NOYW1lPVwibG9nb1wiPlJlYWN0IEJvaWxlcnBsYXRlPC9kaXY+XG4gICAgICAgIDwvaGVhZGVyPlxuICAgICAgICA8bmF2IGNsYXNzTmFtZT17Y2xhc3NuYW1lcygnc2l0ZSB1aS1ibHVlJywgb3Blbil9IG9uQ2xpY2s9e3RoaXMub25DbGljay5iaW5kKHRoaXMsICduYXYnKX0+XG4gICAgICAgICAgPHVsPlxuICAgICAgICAgICAgPGxpPlxuICAgICAgICAgICAgICA8YSBocmVmPVwiI1wiPiBMaW5rIDwvYT5cbiAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgPC91bD5cbiAgICAgICAgPC9uYXY+XG4gICAgICAgIDxtYWluIGNsYXNzTmFtZT17Y2xhc3NuYW1lcyhvcGVuKX0gb25DbGljaz17dGhpcy5vbkNsaWNrLmJpbmQodGhpcywgJ21haW4nKX0+XG4gICAgICAgICAgICB7LyogdGhpcyBpcyB0aGUgaW1wb3J0YW50IHBhcnQgKi99XG4gICAgICAgICAgICA8Um91dGVIYW5kbGVyLz5cbiAgICAgICAgPC9tYWluPlxuICAgICAgPC9kaXY+XG4gICAgKVxuICB9XG5cbn1cblxuZXhwb3J0IGRlZmF1bHQgQXBwO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFRleHRGaWVsZCBmcm9tICcuLi9maWVsZHMvdGV4dC1maWVsZCc7XG5cbmNsYXNzIEhvbWUgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdj5cbiAgICAgICAgPGgyIGNsYXNzTmFtZT1cInRleHQtY2VudGVyXCI+IFJlYWN0IEJvaWxlcnBsYXRlIDwvaDI+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiY29udGFpbmVyXCIgaWQ9XCJhcHBcIj5cbiAgICAgICAgICAgIDxUZXh0RmllbGQvPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IEhvbWU7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBSZWFjdCBmcm9tICdyZWFjdCc7XG5cbmNsYXNzIE5vdEZvdW5kIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoMT4gV2hhdCBZb3UgVGFsa2luZyBBYm91dCwgV2lsbGlzPzwvaDE+XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG5cbn1cblxuXG5leHBvcnQgZGVmYXVsdCBOb3RGb3VuZDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuY2xhc3MgVGV4dEZpZWxkIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgcmVhZDogdHJ1ZSxcbiAgICAgIHZhbHVlOiAnZm9vIGJhcidcbiAgICB9XG4gIH1cblxuICBvbkNsaWNrKCkge1xuICAgIHRoaXMuc2V0U3RhdGUoeyByZWFkOiAhdGhpcy5zdGF0ZS5yZWFkIH0pO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHZhciBpbnB1dCA9IDxpbnB1dCB0eXBlPVwidGV4dFwiIHZhbHVlPXt0aGlzLnN0YXRlLnZhbHVlfS8+O1xuICAgIHZhciBzcGFuID0gPHNwYW4+e3RoaXMuc3RhdGUudmFsdWV9PC9zcGFuPjtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBvbkNsaWNrPXt0aGlzLm9uQ2xpY2suYmluZCh0aGlzKX0+XG4gICAgICAgIHt0aGlzLnN0YXRlLnJlYWQgPyBzcGFuIDogaW5wdXR9XG4gICAgICA8L2Rpdj5cbiAgICApO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRleHRGaWVsZDtcblxuXG4iXX0=
