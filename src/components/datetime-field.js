'use strict';

export default React.createClass({

  render() {
    <fieldset>
      <label> Date </label>
      <input type="datetime-local" name={this.props.name}/>
    </fieldset>
  }

})
