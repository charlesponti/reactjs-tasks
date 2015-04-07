'use strict';

import React from 'react';
import dispatcher from '../app/dispatcher';

export default React.createClass({

  getInitialState(...props) {
    return {};
  },

  _onClick(hashtag) {
    // Check if hashtag is same as currently selected
    let isSelected = this.state.selected === hashtag;

    // Set selected hashtag to state
    this.setState({ selected: hashtag });

    // Dispatch search by hashtag
    dispatcher.dispatch({
      actionType: 'search:hashtag',
      data: isSelected ? undefined : hashtag
    });
  },

  render() {
    return (
      <ul className="task-hashtags-list">
        {this.props.hashtags.map((hashTag) => {
          return (
            <li key={hashTag}
                className={{selected: this.state.selected === hashTag }}>
              <a onClick={this._onClick.bind(this, hashTag)}>
                {{hashTag}}
              </a>
            </li>
          );
        })}
      </ul>
    );
  }

});

