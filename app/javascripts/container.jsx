import React from 'react';


class Container extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      quota: 500
    };
  }

  componentDidMount(){
    this.props.Conference.quota.call().then((quota) => {
      this.setState({ quota: quota.toNumber() });
    });
  }

  render() {
    this.props.Conference.quota.call().then((quota) => {
      console.log(quota.toNumber());
			return this.props.Conference.organizer.call();
	}).then((organizer) => {
      console.log(organizer);
			return this.props.Conference.numRegistrants.call();
	}).then((num) => {
      console.log(num.toNumber());
	});
    return (
      <div className='app'>
        { this.props.Conference.address }<br></br>
        { this.state.quota }
      </div>
    );
  }

}

export default Container;
