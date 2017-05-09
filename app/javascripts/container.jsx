import React from 'react';


class Container extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      quota: 500,
      msgResult: "",
      newQuota: "",
      organizer: "",
      registrants: 0
    };
    this.changeQuota = this.changeQuota.bind(this);
    this.update = this.update.bind(this);
    this.buyTicket = this.buyTicket.bind(this);
  }

  componentWillMount(){
    this.props.Conference.quota.call().then((quota) => {
      this.setState({ quota: quota.toNumber() });
    });
    this.props.Conference.organizer.call().then((organizer) => {
      this.setState({ organizer });
    });
    this.getRegistrants();
  }

  getRegistrants(){
    return this.props.Conference.numRegistrants.call().then((registrants) => {
      this.setState({ registrants: registrants.toNumber() });
    });
  }

  changeQuota() {
  	this.props.Conference.changeQuota(
      this.state.newQuota, { from: this.props.accounts[0] })
      .then(() => {
  			return this.props.Conference.quota.call();
  		}).then((quota) => {
  			if (quota.toNumber() === this.state.newQuota) {
  				var msgResult;
  				msgResult = "Change successful";
          this.setState({ quota: quota.toNumber() });
  			} else {
  				msgResult = "Change failed";
  			}
  			this.setState({ msgResult });
		});
  }

  update(event){
    this.setState({ newQuota: parseInt(event.currentTarget.value) });
  }

  buyTicket(buyerAddress, ticketPrice) {
	  this.props.Conference.buyTicket(
      { from: "0xacac4d1ba451a9c18d88f96bb8758199537d1a64", value: ticketPrice }).then(() => {
			this.getRegistrants();
		}).then(
		function(num) {
      console.log("worked?");
			return this.props.Conference.registrantsPaid.call(buyerAddress);
		}).then(
		function(valuePaid) {
			var msgResult;
			if (valuePaid.toNumber() == ticketPrice) {
				msgResult = "Purchase successful";
			} else {
				msgResult = "Purchase failed";
			}
			$("#buyTicketResult").html(msgResult);
		});
}

  render() {
    let options;
    if (this.props.accounts){
      options = this.props.accounts.slice(1).map(account => {
        return <option key={account}>{ account }</option>;
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
        <select>{ options }</select>
        <button onClick={ this.buyTicket }>Buy Ticket</button>
      </div>
    );
  }

}

export default Container;
