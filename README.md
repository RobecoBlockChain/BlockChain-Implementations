# BlockChain Implementations Guide

More info on the web3 functions and BigNumbers:
https://github.com/ethereum/wiki/wiki/JavaScript-API

To start the server, using the CMD go into the folder where the file 'node.js' is located.

Here type:
`node server.js`

This sets up a port that listens on http://localhost:8080/.

Functions we need in the controller:

 ### Admin Panel  ###
 
##### getBlock() #####
`web3.eth.getBlock(blockHashOrBlockNumber: String, returnTransactionObject: Boolean)`
User has to fill in the blockNumber himself. Properties we need from this object are **BlockNumber: Number**, **Transactions: Array of transaction objects**, **Timestamp: Number**. returnTransactionObject should be true, because this gives us the transaction objects instead of the hashes.

##### getFiveLatestTransactions() #####
`web3.eth.getTransactionFromBlock(hashStringOrNumber: String, indexnumber: Number)`
We need to get the five latest transactions. To do this, we start from the latest BlockNumber:
`web3.eth.blockNumber`
From this block, retrieve the latest transactions. If we still do not have five transactions, repeat this process, going 1 block lower (latest BlockNumber - 1).
Properties we need from this object are  **From: String**, **To: String**, **Value: BigNumber** and **blockNumber: Number**.

##### getFiveLatestBlocks() #####
`getBlock(blockHashOrBlockNumber: String, returnTransactionObject: Boolean)`
Properties we need from this object are **BlockNumber: Number**, **Transactions: Array of transaction objects**, **Timestamp: Number**. returnTransactionObject should be true, because this gives us the transaction objects instead of the hashes.
Start with the latest blockNumber:
`web3.eth.blockNumber`
Use this as a parameter in the getBlock function. Repeat this process till you have five blocks.

##### getInfo() #####
Here we need to return an object with some information about the BlockChain.
We need the following properties: **Network: boolean**, **TotalMoney: Number**, **CurrentBlockNumber: Number**, **CurrentTime: DateTime**.
`web3 = new Web3(new Web3.providers.HttpProvider("http://40.68.223.124:8545"))`
If web3.isConnected() is true, then network is true.
To get the total money in the BlockChain use:
`??`
To get the current BlockNumber use:
`web3.eth.blockNumber`
To get the current Time use:
`require 'date', var = new date?`

 ### Wallet Panel  ###
 
##### getBalance() ##### 
`web3.eth.getBalance(accountAddress: String)`
User fills in his accountAddress and this function returns a **BigNumber** as the amount.
Set this account as defaultAccount, so we can save this value and return it on the page.
`web3.eth.defaultAccount = "userInput"`
##### GetTransactionHistory() ##### 
`??`


##### SendTransaction() ##### 
`web3.eth.sendTransaction(transactionObject: transaction)`
See https://github.com/ethereum/wiki/wiki/JavaScript-API#web3ethsendtransaction for the parameters.
This returns the transaction hash, but we don't need this.

##### GetAccountNumber() ##### 
`web3.eth.defaultAccount`
Return this value.
