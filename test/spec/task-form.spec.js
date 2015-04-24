'use strict';

import React from 'react/addons';
let TestUtils = React.addons.TestUtils;
let TaskForm = require('../../src/tasks/task-form');
let dispatcher = require('../../src/app/dispatcher');

describe('TaskForm', function () {
  'use strict';

  var element;
  var sandbox;

  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    element = TestUtils.renderIntoDocument(<TaskForm />);
  });

  afterEach(function () {
    sandbox.restore();
    if (element && element.isMounted()) {
      React.unmountComponentAtNode(element.getDOMNode().parentNode);
    }
  });

  it('should have an object literal as initial state', function() {
    expect(element.state).to.deep.equal({});
  });

  it('should set state.value to empty string on submit', function() {
    let form = TestUtils.findRenderedDOMComponentWithTag(element, 'form');
    TestUtils.Simulate.submit(form);
    expect(element.state.value).to.equal('');
  });

  it('should call dispatcher.dispatch on submit', function() {
    sandbox.spy(dispatcher, 'dispatch');
    let form = TestUtils.findRenderedDOMComponentWithTag(element, 'form');
    element.refs.name.getDOMNode().value = 'foo';
    TestUtils.Simulate.submit(form);
    expect(dispatcher.dispatch.firstCall.args[0]).to.deep.equal({
      actionType: 'task:create',
      data: {
        description: 'foo'
      }
    });
  });

  it('should set state.value on change of input', function() {
    element.refs.name.getDOMNode().value = 'foo';
    TestUtils.Simulate.change(element.refs.name);
    expect(element.state.value).to.equal('foo');
  });

});
