const GradientCoin = artifacts.require("./GradientCoin.sol");

// Turning should statements into tests with truffle
// describe, it, beforeEach, contract

contract('GradientCoin', function (accounts) {
  it("should return 'GradientCoin' as its name", function() {
   return GradientCoin.deployed()
    .then(function (instance) {
      return instance.name.call();
    })
    .then(function(name) {
      assert.equal(name, "GradientCoin", "Name did not return correctly")
    })
  })

  it("should return 'GRD' as its symbol", function() {
    return GradientCoin.deployed()
      .then(function(instance) {
        return instance.symbol.call()
      })
      .then(function(symbol) {
        assert.equal(symbol, "GRD", "Symbol did not return correctly")
      })
  })

  it("should have a way to mint new tokens and return the new token's ID", function() {
    return GradientCoin.deployed()
      .then(function(instance) {
        return instance.mint("testOuter", "testInner", {from: accounts[0]});
      })
      .then(function(receipt) {
        let tokenId = receipt.logs[0].args.tokenId.toNumber();
        assert.equal(tokenId, 0, "The id did not return as expected");
      })
  })

  it("should broadcast a Mint event whenever a new token is minted", function() {
    return GradientCoin.deployed()
      .then(function(instance) {
        return instance.mint("testOuter2", "testInner2", {from: accounts[0]});
      })
      .then(function(receipt) {
        let event = receipt.logs[0].event;
        assert.equal(event, "Mint", "The Mint event did not return as expected");
      })
  })

  it("should broadcast a Transfer event whenever a new token is minted", function() {
    return GradientCoin.deployed()
      .then(function(instance) {
        return instance.mint("testOuter3", "testInner3", {from: accounts[0]});
      })
      .then(function(receipt) {
        let event = receipt.logs[1].event;
        assert.equal(event, "Transfer", "The Transfer event did not return as expected");
      })
  })
  
  it("should have a way to return the id of all tokens owned by an address", function() {
    return GradientCoin.deployed()
      .then(function(instance) {
        return instance.tokensOfOwner.call(accounts[0]);
      })
      .then(function(tokens) {
        assert.equal(tokens[0].toNumber(), 1, "The Contract did not return the correct number of tokens for this address");
        assert.equal(tokens[1].toNumber(), 2, "The Contract did not return the correct number of tokens for this address");
        assert.equal(tokens[2].toNumber(), 0, "The Contract did not return the correct number of tokens for this address");
      })
  })

  it("should have a way to retreive the address of the owner of a coin using its token ID", function() {
    return GradientCoin.deployed()
      .then(function(instance) {
        return instance.ownerOf.call(1);
      })
      .then(function(address) {
        assert.equal(address, accounts[0], "The outer property did not return as expected");
      })
  })
  
  it("should have a way to retreive the properties of a coin using its token ID", function() {
    return GradientCoin.deployed()
      .then(function(instance) {
        return instance.getToken.call(1);
      })
      .then(function(token) {
        assert.equal(token[0], "testOuter2", "The outer property did not return as expected");
        assert.equal(token[1], "testInner2", "The inner property did not return as expected");
      })
  })

  it("should have a way to retreive the total number of tokens an address has", function() {
    return GradientCoin.deployed()
      .then(function(instance) {
        return instance.balanceOf.call(accounts[0]);
      })
      .then(function(numTokens) {
        assert.equal(numTokens, 3, "The Contract did not return the correct number of tokens for this address");
      })
  })

  it("should have a way for the sender to approve one of his/her tokens for transfer to another address", function() {
    return GradientCoin.deployed()
      .then(function(instance) {
        return instance.approve(accounts[1], 1, {from: accounts[0]})
          .then(function () { return instance.tokenIndexToApproved.call(1)});
      })
      .then(function(approvedAddress) {
        assert.equal(approvedAddress, accounts[1], "The approved address was different than expected");
      })
  })

  it("should broadcast the Approval event whenever a token owner approves that token for transfer to a new address", function() {
      return GradientCoin.deployed()
        .then(function(instance) {
          return instance.approve(accounts[1], 2, {from: accounts[0]});
        })
        .then(function(receipt) {
          let event = receipt.logs[0].event;
          assert.equal(event, "Approval", "The Transfer event did not return as expected");
        })
  })

  it("should have a way to show that a transferred token is owned by the new address", function() {
    return GradientCoin.deployed()
      .then(function(instance) {
        return instance.transfer(accounts[1], 1, {from: accounts[0]})
          .then(function () { return instance.ownerOf.call(1)});
      })
      .then(function(tokenOwner) {
        assert.equal(tokenOwner, accounts[1], "The Contract did not transfer the token as expected");
      })
  })
  
  it("should broadcast the Transfer event whenever a token is transferred to a new address", function() {
    return GradientCoin.deployed()
      .then(function(instance) {
        return instance.transfer(accounts[1], 2, {from: accounts[0]});
      })
      .then(function(receipt) {
        let event = receipt.logs[0].event;
        assert.equal(event, "Transfer", "The Transfer event did not fire off as expected");
      })
  })
});