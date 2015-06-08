'use strict';

import React from 'react';

import Form from '../components/form.js';
import Datetime from '../components/daterange-field.js';

export default React.createClass({

  render() {
    return (
      <div>
        <h5> Date Time </h5>
        <Form fields={[Datetime]}/>
      </div>
    );
  }

})
