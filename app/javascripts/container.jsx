import React from 'react';
import lightwallet from 'eth-lightwallet';
import HookedWeb3Provider from 'hooked-web3-provider';
import Conference from './conference';


class Container extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      msgResult: "",
      newQuota: "",
      registrants: 0,
      password: "",
      accounts: this.props.web3.eth.accounts,
      ticketBuyer: "",
      ticketRefunder: "",
      wallet: "",
      privateKey: ""
    };
    this.buyTicket = this.buyTicket.bind(this);
    this.updateAttribute = this.updateAttribute.bind(this);
    this.refundTicket = this.refundTicket.bind(this);
    this.createWallet = this.createWallet.bind(this);
    this.fundEth = this.fundEth.bind(this);
  }

  componentWillMount(){
    this.setState({ ticketBuyer: this.state.accounts[1] });
    this.setState({ ticketRefunder: this.state.accounts[1] });
  }

  updateAttribute(attribute){
    return (event) => {
      this.setState({ [attribute]: event.currentTarget.value });
    };
  }

  buyTicket() {
	  this.props.Conference.buyTicket(
      { from: this.state.ticketBuyer,
        value: this.props.ticketPrice } )
    .then(() => this.props.Conference.numRegistrants.call()
    .then(registrants => {
      this.setState({ registrants: registrants.toNumber() });
      return this.props.Conference.registrantsPaid.call(this.state.ticketBuyer);
    })).then(valuePaid => {
      if (valuePaid.toNumber() === parseInt(this.props.ticketPrice)) {
        this.setState({ msgResult: "Purchase successful" });
      } else {
        this.setState({ msgResult: "Purchase failed" });
      }
    });
  }

  refundTicket() {
    this.props.Conference.registrantsPaid.call(this.state.ticketRefunder)
    .then(result => {
      if (result.toNumber() === 0) {
        this.setState({ msgResult: "Buyer is not registered - no refund!" });
      } else {
        this.props.Conference.refundTicket(this.state.ticketRefunder,
          this.props.ticketPrice,
        { from: this.state.accounts[0]} ).then(() => {
          return this.props.Conference.numRegistrants.call();
        }).then(num => {
          this.setState({ registrants: num.toNumber() });
          return this.props.Conference.registrantsPaid.call(
            this.state.ticketRefunder
          );
        }).then(valuePaid => {
          if (valuePaid.toNumber() === 0) {
          this.setState({ msgResult: "Refund Successful" });
          } else {
            this.setState({ msgResult: "Refund failed" });
          }
        });
      }
    });
  }

  createWallet() {
    // this.setState({ secretSeed });
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
    let options;
    if (this.state.accounts){
      options = this.state.accounts.slice(1).map(account => {
        return <option key={ account } value={ account }>{ account }</option>;
      });
    }

    return (
      <div className='app'>

        <Conference Conference={ this.props.Conference }
          registrants={ this.state.registrants }
          accounts={ this.state.accounts }/>

        { this.state.msgResult }

        <select onChange={ this.updateAttribute("ticketBuyer") }
                value={ this.state.ticketBuyer }>
                { options }
        </select>
        <button onClick={ this.buyTicket }>Buy Ticket</button><br></br>
        <select onChange={ this.updateAttribute("ticketRefunder") }
                value={ this.state.ticketRefunder }>
                { options }
        </select>
        <button onClick={ this.refundTicket }>Refund Ticket</button><br></br>
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
