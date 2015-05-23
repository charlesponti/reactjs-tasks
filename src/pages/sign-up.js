'use strict';

import React from 'react';

const SignUp = React.createClass({

  getInitialState() {
    return {
      user: new Parse.User()
    }
  },

  onUserFindSuccess(users) {
    let email = this.refs.email.getDOMNode().value;
    let password = this.refs.password.getDOMNode().value;

    if (users.length) {
      users[0].logIn(email, password, {
        success() {
          console.log(arguments);
        }
      })
    }
    else {
      user.signUp(null, {
        success() {
          console.log(arguments);
        },
        error(user, error) {
          // Show the error dmessage somewhere and let the user try again.
          alert("Error: " + error.code + " " + error.message);
        }
      });
    }
  },

  onSubmit(event) {
    event.preventDefault();
    let user = this.state.user;
    let email = this.refs.email.getDOMNode().value;

    if (email && password) {
      // Set email to user
      user.set('username', email);

      // Create new query for looking up user
      const query = new Parse.Query(Parse.User);

      // Query by email
      query.equalTo("username", email);

      // Find user by email
      query.find({
        success: this.onUserFindSuccess.bind(this)
      });
    }
  },

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <input ref="email" type="email" placeholder=" Email Address" />
        <br/>
        <button> Log In </button>
      </form>
    );
  }

});

export default SignUp;
