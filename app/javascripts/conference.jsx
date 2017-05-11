import React from 'react';

class Conference extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      quota: "",
      organizer: "",
      newQuota: "",
      msgResult: ""
    };
    this.updateQuota = this.updateQuota.bind(this);
    this.changeQuota = this.changeQuota.bind(this);
  }

  componentWillMount(){
    this.props.Conference.quota.call().then((quota) => {
      this.setState({ quota: quota.toNumber() });
    });
    this.props.Conference.organizer.call().then((organizer) => {
      this.setState({ organizer });
    });
  }

  updateQuota(event){
    this.setState({ newQuota: parseInt(event.currentTarget.value) });
  }

  changeQuota() {
  	this.props.Conference.changeQuota(
      this.state.newQuota, { from: this.props.accounts[0] })
      .then(() => {
  			return this.props.Conference.quota.call();
  		}).then((quota) => {
  			if (quota.toNumber() === this.state.newQuota) {
  				this.setState({ msgResult: "Change successful" }, () => {
            setTimeout(() => {
              this.setState({ msgResult: "" });
            }, 2000);
          });
          this.setState({ quota: quota.toNumber() });
  			} else {
  				this.setState({ msgResult: "Change failed" }, () => {
            setTimeout(() => {
              this.setState({ msgResult: "" });
            }, 2000);
          });
  			}
		});
  }

  render(){

    return(
      <section className='conference'>
        <div>
          <span>Contract deployed at:</span><span className='push-right'>{ this.props.Conference.address }</span>
        </div>
        <div>
          <span>Max Attendees:</span><span className='push-righter'>{ this.state.quota }</span>
        </div>
        <div>
          <span>Change Quota Amount: </span>
          <input onChange={ this.updateQuota }></input>
          <button onClick={ this.changeQuota }>Change</button>
          { this.state.msgResult }
        </div>

        { this.state.organizer }<br></br>
      </section>
    );
  }
}

export default Conference;
