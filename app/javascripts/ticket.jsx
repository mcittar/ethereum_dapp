import React from 'react';

class Ticket extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      registrants: 0,
      ticketBuyer: this.props.accounts[1],
      ticketRefunder: this.props.accounts[1],
      accounts: this.props.accounts,
      msgResult: ""
    };
    this.refundTicket = this.refundTicket.bind(this);
    this.buyTicket = this.buyTicket.bind(this);
    this.updateAttribute = this.updateAttribute.bind(this);
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
        this.setState({ msgResult: "Purchase successful" }, () => {
          setTimeout(() => {
            this.setState({ msgResult: "" });
          }, 2000);
        });
      } else {
        this.setState({ msgResult: "Purchase failed" }, () => {
          setTimeout(() => {
            this.setState({ msgResult: "" });
          }, 2000);
        });
      }
    });
  }

  refundTicket() {
    this.props.Conference.registrantsPaid.call(this.state.ticketRefunder)
    .then(result => {
      if (result.toNumber() === 0) {
        this.setState({ msgResult: "Buyer is not registered - no refund!" }, () => {
          setTimeout(() => {
            this.setState({ msgResult: "" });
          }, 2000);
        });
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
          this.setState({ msgResult: "Refund Successful" }, () => {
            setTimeout(() => {
              this.setState({ msgResult: "" });
            }, 2000);
          });
          } else {
            this.setState({ msgResult: "Refund failed" }, () => {
              setTimeout(() => {
                this.setState({ msgResult: "" });
              }, 2000);
            });
          }
        });
      }
    });
  }

  render(){
    let options;
    if (this.state.accounts){
      options = this.state.accounts.slice(1).map(account => {
        return <option key={ account } value={ account }>{ account }</option>;
      });
    }

    return(
      <section className='ticket'>

        <div>
          <span>Registrants:</span><span className='push-right'>{ this.state.registrants }</span>
        </div>

        <div>
          <span>Buyer Address: </span>
          <span className='select-style push-righty'>
            <select onChange={ this.updateAttribute("ticketBuyer") }
                    value={ this.state.ticketBuyer }>
                    { options }
            </select>
          </span>
          <button className='push-righty' onClick={ this.buyTicket }>Buy Ticket</button><br></br>
        </div>

        <div>
          <span>Refunder Address: </span>
          <span className='select-style push-righty'>
            <select onChange={ this.updateAttribute("ticketRefunder") }
                    value={ this.state.ticketRefunder }>
                    { options }
            </select>
          </span>

          <button className='push-righty' onClick={ this.refundTicket }>Refund Ticket</button><br></br>
        </div>

        <div>{ this.state.msgResult }</div>

      </section>
    );
  }
}

export default Ticket;
