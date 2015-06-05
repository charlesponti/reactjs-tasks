'use strict';

export default React.createClass({

  onStartDateChange() {

  },

  onEndDateChange() {

  },

  render() {
    let fieldName = this.props.name;

    return (
      <div>
        <fieldset>
          <label> Start Date </label>
          <input type="datetime-local" name={`${fieldName}[start]`}/>
        </fieldset>
        <fieldset>
          <label> End Date </label>
          <input type="datetime-local" name={`${fieldName}[end]`}/>
        </fieldset>
      </div>
    );
  }

})
