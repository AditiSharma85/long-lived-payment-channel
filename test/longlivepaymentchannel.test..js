const LongLivedPaymentChannel = artifacts.require("LongLivedPaymentChannel");

contract(
  "Recipient should be able to withdraw amount and then close",
  (accounts) => {
    // declare all global variables here
    let contractInstance;
    let contractAddress;
    const skey =
      "dec072ad7e4cf54d8bce9ce5b0d7e95ce8473a35f6ce65ab414faea436a2ee86"; // private key
    web3.eth.accounts.wallet.add(`0x${skey}`);
    const masterAccount = accounts[0];
    const sender = web3.eth.accounts.wallet[0].address;
    const senderSkey = web3.eth.accounts.wallet[0].privateKey;
    const recipient = accounts[1];
    const closeDuration = 200;
    const depositAmount = web3.utils.toWei("2", "ether");
    // sender can open the channel (deploy contract and deposit funds)
    before(async () => {
      await web3.eth.sendTransaction({
        from: masterAccount,
        to: sender,
        value: web3.utils.toWei("5", "ether"),
        gas: 21000,
      });
      contractInstance = new web3.eth.Contract(LongLivedPaymentChannel.abi);
      const gas = await contractInstance
        .deploy({
          data: LongLivedPaymentChannel.bytecode,
          from: sender,
          value: depositAmount,
          arguments: [recipient, closeDuration],
        })
        .estimateGas();
      const longLivedPaymentChannelTx = await contractInstance
        .deploy({
          data: LongLivedPaymentChannel.bytecode,
          arguments: [recipient, closeDuration],
        })
        .send({
          from: sender,
          gas,
          value: depositAmount,
        });
      contractAddress = longLivedPaymentChannelTx.options.address;
      const actualSender = await longLivedPaymentChannelTx.methods.sender().call({
        from: recipient,
      });
      const actualRecipient = await longLivedPaymentChannelTx.methods.recipient().call({
        from:accounts[2]
      });
      const actualCloseDuration = await longLivedPaymentChannelTx.methods.closeDuration().call({
        from:accounts[2]
      })
      const actualDepositedAmount = await web3.eth.getBalance(contractAddress);
      // assertions
      assert.equal(actualSender, sender, "Sender is not as expected");
      assert.equal(
        actualDepositedAmount,
        depositAmount,
        "The deposited amount is as expected"
      );
      assert.equal(
        actualRecipient,
        recipient,
        "The recipient is as expected"
      );
      assert.equal(actualCloseDuration,closeDuration,"closeDuration is not as expected")
    });

    it("the recipient should be able to withdraw from the channel", async () => {
      // code that will sign for recipient to withdraw
      // code that will use this sign as well as recipient as caller of `withdraw` function
      // the recipient should be able to close the channel
      // make necessary assertions to validate balance of sender and recipient
    });
  }
);
