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
          React.createElement("div", { className: "container", id: "app" })
        );
      }
    }
  });

  return Home;
})(React.Component);

module.exports = Home;

},{"react":"react"}],7:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC10YXNrcy9zcmMvanMvbWFpbi5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0LXRhc2tzL3NyYy9qcy9hcHAvZGlzcGF0Y2hlci5qcyIsIi9Vc2Vycy9jaGFybGVzcG9udGkvRGV2ZWxvcGVyL3JlYWN0LXRhc2tzL3NyYy9qcy9hcHAvaW5kZXguanMiLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC10YXNrcy9zcmMvanMvYXBwL3JvdXRlci5qc3giLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC10YXNrcy9zcmMvanMvY29tcG9uZW50cy9hcHAuanN4IiwiL1VzZXJzL2NoYXJsZXNwb250aS9EZXZlbG9wZXIvcmVhY3QtdGFza3Mvc3JjL2pzL2NvbXBvbmVudHMvaG9tZS5qc3giLCIvVXNlcnMvY2hhcmxlc3BvbnRpL0RldmVsb3Blci9yZWFjdC10YXNrcy9zcmMvanMvY29tcG9uZW50cy9ub3QtZm91bmQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQSxZQUFZLENBQUM7Ozs7UUFHTixPQUFPOzs7QUNIZCxZQUFZLENBQUM7O0lBRUwsVUFBVSxXQUFPLE1BQU0sRUFBdkIsVUFBVTs7QUFFbEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxJQUFJLFVBQVUsRUFBRSxDQUFDOzs7QUNKbEMsWUFBWSxDQUFDOztBQUViLElBQUksR0FBRyxHQUFHOztBQUVSLFlBQVUsRUFBRSxPQUFPLENBQUMsY0FBYyxDQUFDOztBQUVuQyxRQUFNLEVBQUUsT0FBTyxDQUFDLGNBQWMsQ0FBQzs7Q0FFaEMsQ0FBQzs7QUFFRixNQUFNLENBQUMsT0FBTyxHQUFHLEdBQUcsQ0FBQzs7O0FDVnJCLFlBQVksQ0FBQzs7Ozs7O0lB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WSxDQUFDOzs7Ozs7Ozs7O0lBRU4sS0FBSywyQkFBTSxPQUFPOztJQUduQixJQUFJO1dBQUosSUFBSTswQkFBSixJQUFJOzs7Ozs7O1lBQUosSUFBSTs7ZUFBSixJQUFJO0FBRVIsVUFBTTthQUFBLGtCQUFHO0FBQ1AsZUFDRTs7O1VBQ0U7O2NBQUksU0FBUyxFQUFDLGFBQWE7O1dBQXlCO1VBQ3BELDZCQUFLLFNBQVMsRUFBQyxXQUFXLEVBQUMsRUFBRSxFQUFDLEtBQUssR0FBTztTQUN0QyxDQUNQO09BQ0Y7Ozs7U0FURyxJQUFJO0dBQVMsS0FBSyxDQUFDLFNBQVM7O2lCQWFuQixJQUFJOzs7QUNsQm5CLFlBQVksQ0FBQzs7Ozs7Ozs7OztJQUVOLEtBQUssMkJBQU0sT0FBTzs7SUFFbkIsUUFBUTtXQUFSLFFBQVE7MEJBQVIsUUFBUTs7Ozs7OztZQUFSLFFBQVE7O2VBQVIsUUFBUTtBQUVaLFVBQU07YUFBQSxrQkFBRztBQUNQLGVBQ0U7OztVQUNFOzs7O1dBQXlDO1NBQ3JDLENBQ047T0FDSDs7OztTQVJHLFFBQVE7R0FBUyxLQUFLLENBQUMsU0FBUzs7aUJBYXZCLFFBQVEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4vLyBSZXF1aXJlIGFwcGxpY2F0aW9uXG5pbXBvcnQgJy4vYXBwJztcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IHtEaXNwYXRjaGVyfSBmcm9tICdmbHV4JztcblxubW9kdWxlLmV4cG9ydHMgPSBuZXcgRGlzcGF0Y2hlcigpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgQXBwID0ge1xuXG4gIGRpc3BhdGNoZXI6IHJlcXVpcmUoJy4vZGlzcGF0Y2hlcicpLFxuXG4gIHJvdXRlcjogcmVxdWlyZSgnLi9yb3V0ZXIuanN4JylcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBcHA7XG4iLCIndXNlIHN0cmljdCc7XG5cbi8vIENvbXBvbmVudHNcbmltcG9ydCBBcHAgZnJvbSAnLi4vY29tcG9uZW50cy9hcHAuanN4JztcbmltcG9ydCBIb21lIGZyb20gJy4uL2NvbXBvbmVudHMvaG9tZS5qc3gnO1xuaW1wb3J0IE5vdEZvdW5kIGZyb20gJy4uL2NvbXBvbmVudHMvbm90LWZvdW5kJztcblxuLy8gRGVwZW5kZW5jaWVzXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuaW1wb3J0IFJvdXRlciBmcm9tICdyZWFjdC1yb3V0ZXInO1xuXG5sZXQgUm91dGUgID0gUm91dGVyLlJvdXRlO1xubGV0IERlZmF1bHRSb3V0ZSA9IFJvdXRlci5EZWZhdWx0Um91dGU7XG5sZXQgTm90Rm91bmRSb3V0ZSA9IFJvdXRlci5Ob3RGb3VuZFJvdXRlO1xuXG52YXIgcm91dGVzID0gKFxuICA8Um91dGUgcGF0aD1cIi9cIiBoYW5kbGVyPXtBcHB9PlxuICAgIDxEZWZhdWx0Um91dGUgaGFuZGxlcj17SG9tZX0gLz5cbiAgICA8Tm90Rm91bmRSb3V0ZSBoYW5kbGVyPXtOb3RGb3VuZH0vPlxuICA8L1JvdXRlPlxuKTtcblxuUm91dGVyLnJ1bihyb3V0ZXMsIGZ1bmN0aW9uIChIYW5kbGVyKSB7XG4gIFJlYWN0LnJlbmRlcig8SGFuZGxlci8+LCBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykpO1xufSk7XG5cbi8vIE9yLCBpZiB5b3UnZCBsaWtlIHRvIHVzZSB0aGUgSFRNTDUgaGlzdG9yeSBBUEkgZm9yIGNsZWFuZXIgVVJMczpcbi8vIFJvdXRlci5ydW4ocm91dGVzLCBSb3V0ZXIuSGlzdG9yeUxvY2F0aW9uLCBmdW5jdGlvbiAoSGFuZGxlcikge1xuLy8gICBSZWFjdC5yZW5kZXIoPEhhbmRsZXIvPiwgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYXBwJykpO1xuLy8gfSk7XG4iLCIndXNlIHN0cmljdCc7XG5cbmltcG9ydCBjbGFzc25hbWVzIGZyb20gJ2NsYXNzbmFtZXMnO1xuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcbmltcG9ydCB7Um91dGVIYW5kbGVyfSBmcm9tICdyZWFjdC1yb3V0ZXInO1xuXG5jbGFzcyBBcHAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKCkge1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBvcGVuOiBmYWxzZVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogSGFuZGxlIGNsaWNrIGV2ZW50XG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzb3VyY2VcbiAgICogQHBhcmFtIHtTeW50aGV0aWNFdmVudH0gZXZlbnRcbiAgICovXG4gIG9uQ2xpY2soc291cmNlLCBldmVudCkge1xuICAgIC8vIEFsd2F5cyBjbG9zZSBuYXYgZHJhd2VyIGlmIG1haW4gd2FzIGNsaWNrZWRcbiAgICBpZiAoc291cmNlID09PSAnbWFpbicpXG4gICAgICB0aGlzLnNldFN0YXRlKHsgb3BlbjogZmFsc2UgfSk7XG4gICAgLy8gT3RoZXJ3aXNlIHRvZ2dsZSBvcGVuXG4gICAgZWxzZVxuICAgICAgdGhpcy5zZXRTdGF0ZSh7IG9wZW46ICF0aGlzLnN0YXRlLm9wZW4gfSk7XG4gIH1cblxuICByZW5kZXIoKSB7XG4gICAgbGV0IG9wZW4gPSB7IG9wZW46IHRoaXMuc3RhdGUub3BlbiB9O1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aGVhZGVyIGNsYXNzTmFtZT1cInNpdGUgdWktYmx1ZVwiPlxuICAgICAgICAgICAgPGRpdlxuICAgICAgICAgICAgICBjbGFzc05hbWU9e2NsYXNzbmFtZXMoXCJoYW1idXJnZXIgbWVudVwiLCBvcGVuKX1cbiAgICAgICAgICAgICAgaHJlZj1cIiNcIlxuICAgICAgICAgICAgICBvbkNsaWNrPXt0aGlzLm9uQ2xpY2suYmluZCh0aGlzLCAnaWNvbicpfT5cbiAgICAgICAgICAgICAgPGk+PC9pPlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImxvZ29cIj5SZWFjdCBCb2lsZXJwbGF0ZTwvZGl2PlxuICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgPG5hdiBjbGFzc05hbWU9e2NsYXNzbmFtZXMoJ3NpdGUgdWktYmx1ZScsIG9wZW4pfSBvbkNsaWNrPXt0aGlzLm9uQ2xpY2suYmluZCh0aGlzLCAnbmF2Jyl9PlxuICAgICAgICAgIDx1bD5cbiAgICAgICAgICAgIDxsaT5cbiAgICAgICAgICAgICAgPGEgaHJlZj1cIiNcIj4gTGluayA8L2E+XG4gICAgICAgICAgICA8L2xpPlxuICAgICAgICAgIDwvdWw+XG4gICAgICAgIDwvbmF2PlxuICAgICAgICA8bWFpbiBjbGFzc05hbWU9e2NsYXNzbmFtZXMob3Blbil9IG9uQ2xpY2s9e3RoaXMub25DbGljay5iaW5kKHRoaXMsICdtYWluJyl9PlxuICAgICAgICAgICAgey8qIHRoaXMgaXMgdGhlIGltcG9ydGFudCBwYXJ0ICovfVxuICAgICAgICAgICAgPFJvdXRlSGFuZGxlci8+XG4gICAgICAgIDwvbWFpbj5cbiAgICAgIDwvZGl2PlxuICAgIClcbiAgfVxuXG59XG5cbmV4cG9ydCBkZWZhdWx0IEFwcDtcbiIsIid1c2Ugc3RyaWN0JztcblxuaW1wb3J0IFJlYWN0IGZyb20gJ3JlYWN0JztcblxuXG5jbGFzcyBIb21lIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxkaXY+XG4gICAgICAgIDxoMiBjbGFzc05hbWU9XCJ0ZXh0LWNlbnRlclwiPiBSZWFjdCBCb2lsZXJwbGF0ZSA8L2gyPlxuICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImNvbnRhaW5lclwiIGlkPVwiYXBwXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICApXG4gIH1cblxufVxuXG5leHBvcnQgZGVmYXVsdCBIb21lO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QnO1xuXG5jbGFzcyBOb3RGb3VuZCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2PlxuICAgICAgICA8aDE+IFdoYXQgWW91IFRhbGtpbmcgQWJvdXQsIFdpbGxpcz88L2gxPlxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxuXG59XG5cblxuZXhwb3J0IGRlZmF1bHQgTm90Rm91bmQ7XG4iXX0=
