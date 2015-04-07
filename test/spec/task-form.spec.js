'use strict';

import React from 'react/addons';
let TestUtils = React.addons.TestUtils;
let TaskForm = require('../../src/tasks/task-form');

describe('TaskForm', function () {
  'use strict';

  var element;

  beforeEach(function () {
    element = TestUtils.renderIntoDocument(<TaskForm />);
  });

  afterEach(function () {
    if (element && element.isMounted()) {
      React.unmountComponentAtNode(element.getDOMNode().parentNode);
    }
  });

  it('should set state.value to empty string on submit', function() {
    let form = TestUtils.findRenderedDOMComponentWithTag(element, 'form');
    TestUtils.Simulate.submit(form);
    expect(element.state.value).toEqual('');
  });

});
