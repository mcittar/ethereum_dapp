import React from 'react';
import lightwallet from 'eth-lightwallet';
import HookedWeb3Provider from 'hooked-web3-provider';
import Conference from './conference';
import Ticket from './ticket';


class Container extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      msgResult: "",
      password: "",
      accounts: this.props.web3.eth.accounts,
      wallet: "",
      privateKey: ""
    };
    this.updateAttribute = this.updateAttribute.bind(this);
    this.createWallet = this.createWallet.bind(this);
    this.fundEth = this.fundEth.bind(this);
  }

  updateAttribute(attribute){
    return (event) => {
      this.setState({ [attribute]: event.currentTarget.value });
    };
  }

  createWallet() {
    lightwallet.keystore.createVault({
      password: this.state.password,
    }, (err, ks) => {
      ks.keyFromPassword(this.state.password, (aerr, pwDerivedKey) => {
        if (aerr) throw aerr;
        ks.generateNewAddress(pwDerivedKey);

        let address = ks.getAddresses()[0];
        this.setState({ wallet: "0x" + address});

        let privateKey = ks.exportPrivateKey(address, pwDerivedKey);
        this.setState({ privateKey });

        let balance = this.getBalance(address);
        this.setState({ balance });

        ks.passwordProvider = function (callback) {
          let pw = prompt("Please enter password", "Password");
          callback(null, pw);
        };

        this.switchToHooked3(ks);
      });
    });
  }

  switchToHooked3(_keystore) {
    let web3Provider = new HookedWeb3Provider({
      host: "http://localhost:8545",
      transaction_signer: _keystore
    });

    this.props.web3.setProvider(web3Provider);
    this.setState({ account: this.props.web3.eth.accounts });
  }

  getBalance(address) {
  	return this.props.web3.fromWei(this.props.web3.eth
      .getBalance(address).toNumber(), 'ether');
  }

  fundEth() {
  	let fromAddr = this.state.accounts[0]; // default owner address of client
  	let toAddr = this.state.wallet;
  	let valueEth = 1;
  	let value = parseFloat(valueEth)*1.0e18;
  	let gasPrice = 1000000000000;
  	let gas = 50000;
  	this.props.web3.eth.sendTransaction({from: fromAddr, to: toAddr, value: value},
      (err, txhash) => {
  	  if (err) console.log('ERROR: ' + err);
  	  console.log('txhash: ' + txhash + " (" + valueEth + " in ETH sent)");
      this.setState({ balance: this.getBalance(toAddr) });
  	});
  }

  render() {

    return (
      <div className='app'>

        <Conference Conference={ this.props.Conference }
          accounts={ this.state.accounts }/>

        <Ticket Conference={ this.props.Conference }
          registrants={ this.state.registrants }
          ticketPrice={ this.props.ticketPrice }
          accounts={ this.state.accounts }/>

        { this.state.msgResult }

        <input onChange={ this.updateAttribute("password") }></input>
        <button onClick={ this.createWallet }>Create Wallet</button><br></br>
        { this.state.wallet }<br></br>
        { this.state.privateKey }<br></br>
        { this.state.balance }
        <button onClick={ this.fundEth }>Fund 1 Ether</button><br></br>
      </div>
    );
  }

}

export default Container;
