'use strict';

import React from 'react';

export default React.createClass({

  getInitialState() {
    return {
      options: this.constructOptions(this.props.options)
    };
  },

  constructOptions(options) {
    let pluck = this.props.pluck;
    return options.map(function(item, index) {
      if (!item.text) {
        throw `${this.props.name} must provide text for options`
      }

      if (!item.value) {
        throw `${this.props.name} must provide value for options`
      }

      item.itemId = index;

      return item;
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
