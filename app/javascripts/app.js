// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";
import { default as Web3} from 'web3';
import conferenceArtifacts from '../../build/contracts/Conference.json';
import { default as contract } from 'truffle-contract';
import React from 'react';
import ReactDOM from 'react-dom';
import Container from './container.jsx';

const Conference = contract(conferenceArtifacts);

document.addEventListener('DOMContentLoaded', () => {
  let web3;
  let conferenceContract;
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    web3 = new Web3(
      new Web3.providers.HttpProvider("http://localhost:8545")
    );
  }

  Conference.setProvider(web3.currentProvider);
  var accounts = web3.eth.accounts;
  var ticketPrice = web3.toWei(.05, 'ether');

  Conference.new({ from: accounts[0], gas: 4712388 }).then(conference => {
    conferenceContract = conference;
    const root = document.getElementById('root');
    ReactDOM.render(<Container accounts={ accounts }
      Conference={ conferenceContract }
      ticketPrice={ ticketPrice }
      />, root);
    var initialBalance = web3.eth.getBalance(conference.address).toNumber();
  });

});
