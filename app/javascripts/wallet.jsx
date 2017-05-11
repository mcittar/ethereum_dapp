import React from 'react';
import lightwallet from 'eth-lightwallet';
import HookedWeb3Provider from 'hooked-web3-provider';

class Wallet extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      wallet: "",
      privateKey: "",
      password: "",
      accounts: this.props.accounts,
      balance: 0
    };
    this.createWallet = this.createWallet.bind(this);
    this.fundEth = this.fundEth.bind(this);
    this.updateAttribute = this.updateAttribute.bind(this);
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
    this.setState({ accounts: this.props.web3.eth.accounts });
    console.log(this.props.web3.eth.accounts);
  }

  getBalance(address) {
  	return this.props.web3.fromWei(this.props.web3.eth
      .getBalance(address).toNumber(), 'ether');
  }

  fundEth() {
  	let fromAddr = this.props.web3.eth.accounts[0];
  	let toAddr = this.state.wallet;
  	let valueEth = 1;
  	let value = parseFloat(valueEth)*1.0e18;
  	this.props.web3.eth.sendTransaction({from: fromAddr, to: toAddr, value: value},
      (err, txhash) => {
  	  if (err) console.log('ERROR: ' + err);
  	  console.log('txhash: ' + txhash + " (" + valueEth + " in ETH sent)");
      this.setState({ balance: this.getBalance(toAddr) });
  	});
  }

  render(){

    return(
      <section className='wallet'>
        <div className='header'>
          Create a Wallet
        </div>

        <div>
          <span>Password:</span>
          <span className='push-righty'><input onChange={ this.updateAttribute("password") }></input></span>
          <span className='push-righty'><button onClick={ this.createWallet }>Create Wallet</button></span>
        </div>

        <div>
          <span>Wallet Address: </span><span className='push-right'>{ this.state.wallet }</span>
        </div>

        <div>
          <span>Private Key: </span><span className='push-righter'>{ this.state.privateKey }</span>
        </div>

        <div>
          <span>Wallet Balance: </span>
          <span className='push-right'>{ this.state.balance } ETH</span>
          <span className='push-right'><button onClick={ this.fundEth }>Fund 1 Ether</button></span>
        </div>

      </section>
    );
  }
}

export default Wallet;
