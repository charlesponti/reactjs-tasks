'use strict';

import React from 'react';

const SignUp = React.createClass({

  getInitialState() {
    return {
      user: new Parse.User()
    }
  },

  onSubmit(event) {
    event.preventDefault();
    let email = this.refs.email.getDOMNode().value;
    let password = this.refs.password.getDOMNode().value;
    let passwordConfirmation = this.refs.passwordConfirmation.getDOMNode().value;
    let allValues = email && password && passwordConfirmation;
    let matchingPasswords = password === passwordConfirmation;

    if (allValues && matchingPasswords) {
      this.state.user.set('username', email);
      this.state.user.set('password', password);

      this.state.user.signUp(null, {
        success: function(user) {
          console.log(user);
        },
        error: function(user, error) {
          // Show the error message somewhere and let the user try again.
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
        <input ref="password" type="password" placeholder=" Password" />
        <br/>
        <input ref="passwordConfirmation" type="password" placeholder=" Password Confirmation" />
        <br/>
        <button> Sign Up </button>
      </form>
    );
  }

});

export default SignUp;
