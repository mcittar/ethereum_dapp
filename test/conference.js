let Conference = artifacts.require("./Conference.sol");

contract('Conference', function(accounts) {

  it("Initial conference settings should match", function(done) {
  	Conference.new({from: accounts[0]}).then(
  		function(conference) {
  			conference.quota.call().then(
  				function(quota) {
  					assert.equal(quota, 500, "Quota doesn't match!");
  			}).then(
  				function() {
  					return conference.numRegistrants.call();
  			}).then(
  				function(num) {
  					assert.equal(num, 0, "Registrants doesn't match!");
  					return conference.organizer.call();
  			}).then(
  				function(organizer) {
  					assert.equal(organizer, accounts[0], "Owner doesn't match!");
  					done();
  			}).catch(done);
  	}).catch(done);
  });

  it("Should update quota", function(done) {
    Conference.new({from: accounts[0] }).then(
      function(conference) {
        conference.quota.call().then(
          function(quota) {
            assert.equal(quota, 500, "Quota doesn't match!");
          }).then( function() {
            return conference.changeQuota(300);
          }).then( function(result) {  // result here is a transaction hash
            return conference.quota.call()
          }).then( function(quota) {
            assert.equal(quota, 300, "New quota is not correct!");
            done();
          }).catch(done);
      }).catch(done);
  });

  it("Should let you buy a ticket", function(done) {
    Conference.new({ from: accounts[0] }).then(
      function(conference) {
        let ticketPrice = web3.toWei(.05, 'ether');
        let initialBalance = web3.eth.getBalance(conference.address).toNumber();

        conference.buyTicket({ from: accounts[1], value: ticketPrice }).then(
          function() {
            let newBalance = web3.eth.getBalance(conference.address).toNumber();
            let difference = newBalance - initialBalance;
            assert.equal(difference, ticketPrice, "Difference should be what was sent");
            return conference.numRegistrants.call();
        }).then(function(num) {
            assert.equal(num, 1, "there should be 1 registrant");
            return conference.registrantsPaid.call(accounts[1]);
        }).then(function(amount) {
            assert(amount.equals(ticketPrice))
            done();
        }).catch(done);
    }).catch(done);
  });

  it("Should issue a refund by owner only", function(done) {
    Conference.new({ from: accounts[0] }).then(
      function(conference) {
        let ticketPrice = web3.toWei(.05, 'ether');
        let initialBalance = web3.eth.getBalance(conference.address).toNumber();

        conference.buyTicket({ from: accounts[1], value: ticketPrice }).then(
          function() {
            let newBalance = web3.eth.getBalance(conference.address).toNumber();
            let difference = newBalance - initialBalance;
            assert.equal(difference, ticketPrice, "Difference should be what was sent");
            return conference.refundTicket(accounts[1], ticketPrice, {from: accounts[1]});
          }).then(
            function() {
              let balance = web3.eth.getBalance(conference.address).toNumber();
              assert.equal(web3.toBigNumber(balance), ticketPrice, "Balance should be unchanged");
              return conference.refundTicket(accounts[1], ticketPrice, {from: accounts[0]});
          }).then(
            function() {
              let postRefundBalance = web3.eth.getBalance(conference.address).toNumber();
              assert.equal(postRefundBalance, initialBalance, "Balance should be initial balance");
              done();
          }).catch(done);
      }).catch(done);
    });

  it("Should silently fail when the stack is too large", function(done) {
    Conference.new({ from: accounts[0] }).then(function(conference){
      let ticketPrice = web3.toWei(.05, 'ether');
      let initialBalance = web3.eth.getBalance(conference.address).toNumber();
      conference.buyTicket({ from: accounts[1], value: ticketPrice }).then(
        function() {
          let newBalance = web3.eth.getBalance(conference.address).toNumber();
          let difference = newBalance - initialBalance;
          assert.equal(difference, ticketPrice, "Difference should be what was sent");
          return conference.breakSend(accounts[1], ticketPrice, 0);
        }).then(
          function(){
            let balance = web3.eth.getBalance(conference.address).toNumber();
            assert.equal(balance, initialBalance, "Balance should be initial balance");
            done();
          });
    }).catch(done);
  });
});
