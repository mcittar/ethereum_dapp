import { default as Web3} from 'web3';
import conference_artifacts from '../../build/contracts/Conference.json';
import { default as contract } from 'truffle-contract';
import React from 'react';
import ReactDOM from 'react-dom';
import App from './container.jsx';

const Conference = contract(conference_artifacts);
let web3;

document.addEventListener('DOMContentLoaded', () => {
  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    web3 = new Web3(
      new Web3.providers.HttpProvider("http://localhost:8545")
    );
  }
  Conference.setProvider(web3.currentProvider);
  var accounts = web3.eth.accounts;

  Conference.new({ from: accounts[0], gas: 4712388 }).then(
    function(conference) {

    var ticketPrice = web3.toWei(.05, 'ether');
    var initialBalance = web3.eth.getBalance(conference.address).toNumber();
    console.log("The conference's initial balance is: " + initialBalance);

    conference.buyTicket({ from: accounts[1], value: ticketPrice }).then(
      function() {
        var newBalance = web3.eth.getBalance(conference.address).toNumber();
        console.log("After someone bought a ticket it's: " + newBalance);
        return conference.refundTicket(accounts[1], ticketPrice, {from: accounts[0]});
      }).then(
        function() {
          var balance = web3.eth.getBalance(conference.address).toNumber();
          console.log("After a refund it's: " + balance);
      });
  });

  const root = document.getElementById('root');
  ReactDOM.render(<App />, root);
});
