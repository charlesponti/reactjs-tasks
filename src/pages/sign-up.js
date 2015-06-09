'use strict';

import React from 'react';
import PasswordField from '../components/password-field.js';
import Spinner from '../components/spinner.js';

const SignUp = React.createClass({

  getInitialState() {
    return {
      user: new Parse.User()
    }
  },

  onUserFindSuccess(users) {
    let email = this.refs.email.getDOMNode().value;

    this.setState({
      // Show password field
      userFound: true,
      // Stop spinner
      findingUser: false
    });
    //let password = this.refs.password.getDOMNode().value;
    //
    //if (users.length) {
    //  users[0].logIn(email, password, {
    //    success() {
    //      console.log(arguments);
    //    }
    //  })
    //}
    //else {
    //  user.signUp(null, {
    //    success() {
    //      console.log(arguments);
    //    },
    //    error(user, error) {
    //      // Show the error dmessage somewhere and let the user try again.
    //      alert("Error: " + error.code + " " + error.message);
    //    }
    //  });
    //}
  },

  onSubmit(event) {
    event.preventDefault();
    let user = this.state.user;
    let email = this.refs.email.getDOMNode().value;

    if (email) {
      // Set email to user
      user.set('username', email);

      // Create new query for looking up user
      const query = new Parse.Query(Parse.User);

      // Query by email
      query.equalTo("username", email);

      // Start spinner
      this.setState({
        findingUser: true
      });

      // Find user by email
      query.find({
        success: this.onUserFindSuccess
      });
    }
  },

  render() {
    return (
      <form onSubmit={this.onSubmit}>
        <fieldset>
          <label htmlFor="Email"> Email Address </label>
          <input ref="email" type="email"
               disabled={this.state.userFound}/>
        </fieldset>
        <Spinner show={this.state.findingUser} spin={this.state.findingUser}/>
        <br/>
        <PasswordField userFound={this.state.userFound}/>
        <button> Log In </button>
      </form>
    );
  }

});

export default SignUp;
