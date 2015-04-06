'use strict';

import React from 'react/addons';
let TestUtils = React.addons.TestUtils;
let TaskList = require('../../src/tasks/task-list');

describe('Example', function() {
  'use strict';

  var element;

  beforeEach(function() {
    let tasks = [
      { description: 'foo', id: 1 },
      { description: 'bar', id: 2 },
      { description: 'baz', id: 3 }
    ];
    element = TestUtils.renderIntoDocument(<TaskList tasks={tasks}/>);
  });

  afterEach(function() {
    if (element && element.isMounted()) {
      React.unmountComponentAtNode(element.getDOMNode().parentNode);
    }
  });

  it('should have three tasks', function() {
    expect(element.props.tasks.length).toEqual(3);
  });

  it('should have three <li> items', function() {
    var listItems = TestUtils.scryRenderedDOMComponentsWithClass(element, 'task-list-item');
    expect(listItems.length).toEqual(3);
  });

});
