import React from 'react';
import Wallet from './wallet';
import Conference from './conference';
import Ticket from './ticket';


class Container extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      msgResult: "",
    };
  }

  render() {

    return (
      <div className='app'>

        <Conference Conference={ this.props.Conference }
          accounts={ this.state.accounts }/>

        <Ticket Conference={ this.props.Conference }
          registrants={ this.state.registrants }
          ticketPrice={ this.props.ticketPrice }
          accounts={ this.props.web3.eth.accounts }/>

        <Wallet web3={ this.props.web3 }/>
        { this.state.msgResult }

      </div>
    );
  }

}

export default Container;
