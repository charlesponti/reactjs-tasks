'use strict';

import React from 'react';

const SignUp = React.createClass({

  getInitialState() {
    return {
      user: new Parse.User()
    }
  },

  onSubmit() {
    let email = this.refs.email.getDOMNode().value;
    let password = this.refs.password.getDOMNode().value;
    let passwordConfirmation = this.refs.passwordConfirmation.getDOMNode().value;
    let allValues = username && password && passwordConfirmation;
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
  render() {
    return (
      <div>
        <input type="email" placeholder=" Email Address" />
        <button> Sign Up </button>
      </div>
    );
  }

});

export default SignUp;
