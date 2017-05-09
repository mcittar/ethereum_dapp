// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

var Web3 = require("web3");
import React from 'react';
import ReactDOM from 'react-dom';
import App from './container.jsx';

document.addEventListener('DOMContentLoaded', () => {
  if (typeof web3 !== 'undefined') {
    window.web3 = new Web3(web3.currentProvider);
  } else {
    window.web3 = new Web3(
      new Web3.providers.HttpProvider("http://localhost:8545")
    );
  }
  const root = document.getElementById('root');

  ReactDOM.render(<App />, root);
});
