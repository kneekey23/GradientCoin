// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import Web3 from 'web3';
import contract from 'truffle-contract';

// Import our contract artifacts and turn them into usable abstractions.
import gradientcoin_artifacts from '../../build/contracts/GradientCoin.json'

const GradientCoin = contract(gradientcoin_artifacts);

var instance;
var accounts;
var account;

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://127.0.0.1:7545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:7545"));
  }

  GradientCoin.setProvider(web3.currentProvider);

  GradientCoin.deployed().then(function (ins) {
    instance = ins;
    App.start();
  });
});

window.App = {
  start: function () {
    var self = this;

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function (err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      self.refreshTokensDom();
    });
  },

  totalSupply: async function () {
    try {
      let totalSupply = await instance.totalSupply.call(account);
      console.log("Total supply result: ", totalSupply.toNumber());
      return totalSupply.toNumber();
    } catch (e) {
      console.log(e);
      return;
    }
  },

  getToken: async function (tokenId) {
    try {
      let token = await instance.getToken.call(tokenId);
      console.log(`Token with id ${tokenId}: `, token);
      return token;
    } catch (e) {
      console.log(e);
      return;
    }
  },

  balanceOf: async function (ownerAddress) {
    try {
      let balance = await instance.balanceOf.call(ownerAddress);
      console.log(`Number of Gradient Tokens owned by address ${ownerAddress} is: `, balance.toNumber());
      //return balance.toNumber();
    } catch (e) {
      console.log(e);
      return;
    }
  },

  // Returns the address of the token Id provided
  ownerOf: async function (tokenId) {
    try {
      let owner = await instance.ownerOf.call(tokenId);
      console.log(owner);
      return owner;
    } catch (e) {
      console.log(e);
      return;
    }
  },

  // List of all token Ids an address has ownership of
  tokensOfOwner: async function (ownerAddress) {
    try {
      let rawTokens = await instance.tokensOfOwner.call(ownerAddress);
      let tokens = rawTokens.map(token => token.toNumber());
      console.log(tokens);
      return tokens;
    } catch (e) {
      console.log(e);
      return;
    }
  },

  // combine with transfer into a handler function
  approve: async function (toAddress, tokenId) {
    try {
      let tx = await instance.approve(toAddress, tokenId, {
        from: account
      });
      return tx.receipt;
    } catch (e) {
      console.log(e);
      return;
    }
  },

  // combine with approve into a handler function
  transfer: async function (toAddress, tokenId) {
    try {
      let tx = await instance.transfer(toAddress, tokenId, {
        from: account
      });
      return tx.receipt;
    } catch (e) {
      console.log(e);
      return;
    }
  },

  transferHandler: async function (toAddress, tokenId) {
    let approvalReceipt = await this.approve(toAddress, tokenId);
    console.log("Transer of ownership approved! Printing approval receipt: ", approvalReceipt);
    console.log("Now attempting to transfer ownership...")
    try {
      let transferReceipt = await this.transfer(toAddress, tokenId, {
        from: account
      });
      console.log("Transfer of ownership completed successfully! Printing transaction receipt: ", transferReceipt)
      this.refreshTokensDom();
    } catch (e) {
      console.log(e);
      return;
    }
  },

  mint: async function (outerColor, innerColor) {
    try {
      let tx = await instance.mint(outerColor, innerColor, {
        from: account
      });
      console.log("Minting successful! Here is the transaction object:", tx);
      return tx;
    } catch (e) {
      console.log(e);
      return;
    }
  },

  mintHandler: async function () {
    try {
      let outer = colorForm.outerColor.value;
      let inner = colorForm.innerColor.value;
      let receipt = await this.mint(outer, inner);
      let newTokenId = receipt.logs[0].args.tokenId.toNumber();
      console.log("Id of newly minted token is: ", newTokenId);
    } catch (e) {
      console.log(e);
    }
  },

  displayStatusDom: function () {
    var self = this;
    console.log("displayStatusDom not yet implemented")
  },

  refreshTokensDom: async function () {
    var self = this;
    let tokens = await self.tokensOfOwner(account);
    tokens.map(async token => {
      let tokenData = await self.getToken(token);
      console.log(tokenData);
      $("#owner-colors").append(`<span class="coin" style="background: radial-gradient(#${tokenData[0]}, #${tokenData[1]})"</span>`)
    });

  }
};

// //TODO: Need to listen to events more effectively
// transferEvent = instance.Transfer({}, {fromBlock: 0, toBlock: 'latest'})
//   .watch(this.transferEventCallback);
// approvalEvent = instance.Approval({}, {fromBlock: 0, toBlock: 'latest'})
//   .watch(this.approvalEventCallback);
// mintEvent = instance.Mint({}, {fromBlock: 0, toBlock: 'latest'})
//   .watch(this.mintEventCallback);
//   mintEventCallback(err, res) {
//     if (!err) {
//       console.log(res);
//     } else {
//       console.log(err);
//     }
//   },

//   approvalEventCallback(err, res) {
//     if (!err) {
//       console.log(res);
//     } else {
//       console.log(err);
//     }
//   },

//   transferEventCallback(err, res) {
//     if (!err) {
//       console.log(res);
//     } else {
//       console.log(err);
//     }
//   },