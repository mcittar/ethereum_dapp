import React from 'react';
import lightwallet from './lightwallet.min.js';
import { switchToHooked3 } from './hooked-web3-provider.min.js';


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
      secretSeed: ""
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

	let secretSeed = lightwallet.keystore.generateRandomSeed();

  this.setState({ secretSeed });
	lightwallet.keystore.deriveKeyFromPassword(this.state.password,
    (err, pwDerivedKey) => {
		console.log("createWallet");
    console.log(secretSeed);
		let keystore = new lightwallet.keystore(secretSeed, pwDerivedKey);

		// generate one new address/private key pairs
		// the corresponding private keys are also encrypted
		keystore.generateNewAddress(pwDerivedKey);

		let address = keystore.getAddresses()[0];

		let privateKey = keystore.exportPrivateKey(address, pwDerivedKey);

		console.log(address);

		// $("#wallet").html("0x"+address);
		// $("#privateKey").html(privateKey);
		// $("#balance").html(getBalance(address));


		// Now set ks as transaction_signer in the hooked web3 provider
		// and you can start using web3 using the keys/addresses in ks!
		switchToHooked3(keystore);

	});
}


  render() {
    let options;
    if (this.state.accounts){
      options = this.props.accounts.slice(1).map(account => {
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
      </div>
    );
  }

}

export default Container;
