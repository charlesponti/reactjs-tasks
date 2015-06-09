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

    if (!found) {
      return console.error('Cannot select dropdown item by value',
        this.state.options.map(val => val.value), value);
    }

    this.setState({
      selected: found
    });

    let value = found.value;

    if (this.props.pluck && this.state.model) {
      window.cloneInto(this.state.model, value);
    }
    else {
      this.setState({
        readOnlyView: true,
        model: value,
        selectedItemText: value.text
      });
    }
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

  render() {
    let spinner = (
      <i style="color: darkgray; font-size:20px" class="fa fa-refresh fa-spin"></i>
    );
    let selected = this.state.selected;

    return (
      <fieldset>
        <label>{this.props.label}</label>
        <div className="ui-dropdown">
          {this.state.loadingItems ? spinner : <span></span>}
          <select onChange={this.onChange}
                  name={this.props.name}
                  value={this.props.initial}>
          </select>
          <div className="ui-dropdown__selected">
            {selected ? selected.label : ''}
          </div>
          <div className="ui-dropdown__options">
            {this.state.options.map((option, index) => {
              return (
                <div key={index}>
                  {option.label}
                  <option value={index}></option>
                </div>
              );
            })}
          </div>
        </div>
      </fieldset>
    );
  }

});
