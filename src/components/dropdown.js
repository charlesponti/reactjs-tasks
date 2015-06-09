'use strict';

'use strict';

export default React.createClass({

  getInitialState() {
    return {
      options: this.constructOptions(this.props.options)
    };
  },

  selectItemByValue() {
    if (value == null) return;

    let found = _.find(this.state.options, function(item) {
      let val;

      if (typeof item.value === 'object') {
        val = window.plucker($scope.pluck, item.value).toLowerCase();
      }
      else if (typeof item.value === 'string') {
        val = item.value.toLowerCase();
      }

      if (typeof value === 'object') {
        return val === window.plucker($scope.pluck, value).toLowerCase();
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

      if (type === 'string') {
        item = {
          text: item,
          value: item
        };
      }
      else if (type === 'object' && pluck) {
        item = {
          text: window.plucker(pluck, item),
          value: item
        };
      }

      item.itemID = index;

      if (pluck) {
        item[pluck] = window.plucker(pluck, item.value);
      }

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

  render() {
    let spinner = (
      <i style="color: darkgray; font-size:20px" class="fa fa-refresh fa-spin"></i>
    );

    return (
      <span>
        {this.state.loadingItems ? spinner : <span></span>}
        <select onChange={this.onChange}
                name={this.props.name}
                value={this.props.initial}>
          {this.state.options.map((option, index) => {
            return (
              <option value={index} key={index}>{option.text}</option>
            );
          })}
        </select>
      </span>
    );
  }

});

