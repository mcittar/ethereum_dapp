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

  render() {
    return (
      <div className='app'>
        { this.props.Conference.address }<br></br>
        { this.state.quota }<br></br>
        { this.state.organizer }<br></br>
        { this.state.registrants }<br></br>
        { this.state.msgResult }
        <input onChange={ this.update }></input>
        <button onClick={ this.changeQuota }>Update Value</button>
      </div>
    );
  }

}

export default Container;
