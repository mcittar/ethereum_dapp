pragma solidity ^0.4.4;

contract Conference {
  address public organizer;
  mapping (address => uint) public registrantsPaid;
  uint public numRegistrants;
  uint public quota;

  event Deposit(address _from, uint _amount);
  event Refund(address _to, uint _amount);

  function Conference() {
    organizer = msg.sender;
    quota = 500;
    numRegistrants = 0;
  }

  function buyTicket() public payable returns (bool success) {
    if (numRegistrants >= quota) { return false; }
    if (registrantsPaid[msg.sender] > 0) { return false; }
    registrantsPaid[msg.sender] = msg.value;
    numRegistrants++;
    Deposit(msg.sender, msg.value);
    return true;
  }

  function changeQuota(uint newquota) public {
    if (msg.sender != organizer) { return; }
    quota = newquota;
  }

  function refundTicket(address recipient, uint amount) public {
    if (msg.sender != organizer) { return; }
    if (registrantsPaid[recipient] < amount) { throw; }
    address myAddress = this;
    if (myAddress.balance < amount) { throw; }
    recipient.send(amount);
    registrantsPaid[recipient] = 0;
    numRegistrants--;
    Refund(recipient, amount);
  }

  function breakSend(address recipient, uint amount, uint times) public {
    if (times < 300) {
      breakSend(recipient, amount, times + 1);
    } else {
      refundTicket(recipient, amount);
    }
  }

  function destroy() {
    if (msg.sender == organizer) {
      suicide(organizer);
    }
  }
}
