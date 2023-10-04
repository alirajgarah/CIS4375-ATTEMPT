import React, { Component } from 'react';
import axios from 'axios';
import './App.css';
import BluePage from './BluePage'; 
import RedPage from './RedPage'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

class App extends Component {
  constructor() {
    super();
    this.state = {
      user_name: '',
      pass_word: '',
      message: '',
      loggedIn: false,
      shouldRedirect: false,
    };
  }

  handleInputChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  handleLogin = () => {
    const { user_name, pass_word } = this.state;

    axios
      .post('http://localhost:3002/login', {
        user_name,
        pass_word,
      })
      .then((response) => {
        if (response.status === 200) {
          this.setState({ message: 'Login successful! Redirecting...' });

          setTimeout(() => {
            this.setState({ loggedIn: true, shouldRedirect: true });
          }, 1500);
        } else {
          this.setState({ message: 'Invalid username or password' });
        }
      })
      .catch((error) => {
        console.error('Error:', error);
        this.setState({ message: 'Login failed' });
      });
  };

  render() {
    return (
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/"
              element={
                this.state.shouldRedirect ? (
                  <Navigate to="/bluepage" replace={true} />
                ) : (
                  <div className="login-container">
                    <h1>AdVantage Dashboard</h1>
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
                )
              }
            />
            <Route path="bluepage" element={<BluePage />} />
            <Route path="redpage" element={<RedPage />} />
          </Routes>
        </div>
      </Router>
    );
  }
}

export default App;
