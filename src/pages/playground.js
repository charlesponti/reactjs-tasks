'use strict';

import React from 'react';

import Form from '../components/form.js';
import Datetime from '../components/daterange-field.js';
import Dropdown from '../components/dropdown/index.js';

export default React.createClass({

  render() {
    let dropOptions = [
      'foo',
      'bar',
      'baz'
    ];

    return (
      <div>
        <h5> Date Time </h5>
        <Dropdown name="foo" options={dropOptions} label="Foo" />
        <Form fields={[Datetime]}/>
      </div>
    );
  }

})
