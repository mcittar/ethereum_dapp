import React from 'react';
import lightwallet from 'eth-lightwallet';
import HookedWeb3Provider from 'hooked-web3-provider';


class Container extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      quota: 500,
      msgResult: "",
      newQuota: "",
      organizer: "",
      registrants: 0,
      password: "",
      accounts: this.props.web3.eth.accounts,
      ticketBuyer: "",
      ticketRefunder: "",
      wallet: ""
    };
    this.changeQuota = this.changeQuota.bind(this);
    this.update = this.update.bind(this);
    this.buyTicket = this.buyTicket.bind(this);
    this.updateAttribute = this.updateAttribute.bind(this);
    this.refundTicket = this.refundTicket.bind(this);
    this.createWallet = this.createWallet.bind(this);
  }

  componentWillMount(){
    this.props.Conference.quota.call().then((quota) => {
      this.setState({ quota: quota.toNumber() });
    });
    this.props.Conference.organizer.call().then((organizer) => {
      this.setState({ organizer });
    });
    this.props.Conference.numRegistrants.call().then((registrants) => {
      this.setState({ registrants: registrants.toNumber() });
    });
    this.setState({ ticketBuyer: this.state.accounts[1] });
    this.setState({ ticketRefunder: this.state.accounts[1] });
  }

  changeQuota() {
  	this.props.Conference.changeQuota(
      this.state.newQuota, { from: this.state.accounts[0] })
      .then(() => {
  			return this.props.Conference.quota.call();
  		}).then((quota) => {
  			if (quota.toNumber() === this.state.newQuota) {
  				this.setState({ msgResult: "Change successful" });
          this.setState({ quota: quota.toNumber() });
  			} else {
  				this.setState({ msgResult: "Change failed" });
  			}
		});
  }

  update(event){
    this.setState({ newQuota: parseInt(event.currentTarget.value) });
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

        ks.passwordProvider = function (callback) {
          let pw = prompt("Please enter password", "Password");
          callback(null, pw);
        };

        this.switchToHooked3(ks);
      });
    });

		// $("#wallet").html("0x"+address);
		// $("#privateKey").html(privateKey);
		// $("#balance").html(getBalance(address));
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


  render() {
    let options;
    if (this.state.accounts){
      options = this.state.accounts.slice(1).map(account => {
        return <option key={ account } value={ account }>{ account }</option>;
      });
    }

    return (
      <div className='app'>
        { this.props.Conference.address }<br></br>
        { this.state.quota }<br></br>
        { this.state.organizer }<br></br>
        { this.state.registrants }<br></br>
        { this.state.msgResult }
        <input onChange={ this.update }></input>
        <button onClick={ this.changeQuota }>Update Value</button><br></br>
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
        { this.state.wallet }
      </div>
    );
  }

}

export default Container;
