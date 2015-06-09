'use strict';

import React from 'react';

export default React.createClass({

  onStartDateChange(event) {
    let value = event.target.value;
  },

  onStartTimeChange(event) {
    let value = event.target.value;
  },

  onEndDateChange(event) {
    let value = event.target.value;
  },

  onEndTimeChange(event) {
    let value = event.target.value;
  },

  render() {
    let fieldName = this.props.name;

    return (
      <div>
        <fieldset>
          <label> Start Date </label>
          <input type="date"
                 ref="startDate"
                 name={`${fieldName}[startDate]`}
                 onChange={this.onStartDateChange}/>
          <input type="time"
                 ref="startTime"
                 name={`${fieldName}[startTime]`}
                 onChange={this.onStartTimeChange}/>
        </fieldset>
        <fieldset>
          <label> End Date </label>
          <input type="date"
                 ref="endDate"
                 name={`${fieldName}[end]`}
                 onChange={this.onEndDateChange}/>
          <input type="time"
                 ref="endTime"
                 name={`${fieldName}[endTime]`}
                 onChange={this.onEndTimeChange}/>
        </fieldset>
      </div>
    );
  }

});
