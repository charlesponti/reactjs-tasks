'use strict';

import React from 'react';

export default React.createClass({

  getInitialState() {
    return {
      options: this.constructOptions(this.props.options)
    };
  },

  selectItemByValue(value) {
    let pluck = this.props.pluck;

    let found = _.find(this.state.options, function(item) {
      let val;

      if (typeof item.value === 'object') {
        val = plucker(pluck, item.value);
      }
      else if (typeof item.value === 'string') {
        val = item.value.toLowerCase();
      }

      if (typeof value === 'object') {
        return val === plucker(pluck, value);
      }
      else if (typeof value === 'string') {
        return  val === value.toLowerCase();
      }

      // Not using type-checking equality because there are times when
      // value is a number and val is a string
      return val == value;
    });

    this.setState({
      selected: found
    });
  },

  constructOptions(options) {
    let pluck = this.props.pluck;
    return options.map(function(item, index) {
      let type = typeof item;

      let option = {
        itemId: index,
        value: item
      };

      if (type === 'string') {
        option.label = item;
      }

      if (type === 'object' && pluck) {
        option.label = plucker(pluck, item);
      }

      return option;
    });
  },

  componentDidMount() {
    if (this.props.initial) {
      this.setState({
        initial: this.props.initial
      });
    }
  },

  onChange() {
    // Emit value
    AppDispatcher.emit(
      `${this.props.name}:select`,
      this.state.options[parseInt(value)]);
  },

  onOptionClick(option, event) {
    event.stopPropagation();

    this.setState({
      selected: option
    })
  },

  render() {
    let spinner = (
      <i style="color: darkgray; font-size:20px" className="fa fa-refresh fa-spin"></i>
    );
    let selected = this.state.selected;

    return (
      <fieldset>
        <label>{this.props.label}</label>
        <div className="dropdown">
          {this.state.loadingItems ? spinner : <span></span>}
          <select onChange={this.onChange}
                  name={this.props.name}
                  value={this.props.initial}
                  style={{display: 'none'}}>
          </select>
          <a id="dLabel" data-target="#" href="#" data-toggle="dropdown" aria-haspopup="true" role="button" aria-expanded="false">
            {selected ? selected.label : 'Select one'}
            <span className="caret"></span>
          </a>

          <ul className="dropdown-menu" role="menu" aria-labelledby="dLabel">
            {this.state.options.map((option, index) => {
              return (
                <li key={index} onClick={this.onOptionClick.bind(null, option)}>
                  {option.label}
                </li>
              );
            })}
          </ul>
        </div>
      </fieldset>
    );
  }

});
