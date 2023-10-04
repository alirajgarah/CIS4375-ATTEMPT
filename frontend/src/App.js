import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import BluePage from './BluePage'; // Import the BluePage component

class App extends Component {
  constructor() {
    super();
    this.state = {
      user_name: '',
      pass_word: '',
      message: '',
      loggedIn: false, // Track whether the user is logged in
    };
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleLogin = () => {
    const { user_name, pass_word } = this.state;

    axios
      .post('http://localhost:3000/login', {
        user_name,
        pass_word,
      })
      .then((response) => {
        if (response.status === 200) {
          this.setState({ message: 'Login successful', loggedIn: true });
        } else {
          this.setState({ message: 'Invalid username or password' });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        this.setState({ message: 'Invalid' });
      });
  };

  render() {
    // If the user is logged in, redirect to the BluePage
    if (this.state.loggedIn) {
      return <BluePage />;
    }

    return (
      <div className="App">
        <div className="login-container">
          <h1>AdVantage</h1>
          <div className="input-container">
            <input
              type="text"
              name="user_name"
              placeholder="Username"
              onChange={this.handleInputChange}
            />
          </div>
          <div className="input-container">
            <input
              type="password"
              name="pass_word"
              placeholder="Password"
              onChange={this.handleInputChange}
            />
          </div>
          <button onClick={this.handleLogin}>Login</button>
          <p>{this.state.message}</p>
        </div>
      </div>
    );
  }
}

export default App;

