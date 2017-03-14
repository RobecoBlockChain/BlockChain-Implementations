// the EthereumController is our ethereum subclass from BaseController
// here we implement all specific functions (that start with an underscore _)
// in the EthereumController we make use of the web3.js API
// See https://github.com/ethereum/wiki/wiki/JavaScript-API

var BaseController = require('../../Controllers/BaseController.js');
var util = require('util'); 
var Web3 = require('web3');
var moment = require('moment');

util.inherits(EthereumController, BaseController);
moment().format();

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds().toString();
  
  // We want a 4 to output as 04, etc.
  if (sec.length == 1) {	
		var sec = '0' + sec;  
  }
  
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  return time;
}

// constructor
function EthereumController() {
    BaseController.apply(this, arguments);
}

// here is the code for initializing our blockchain
EthereumController.prototype._init = function () { 	
	if (typeof web3 !== 'undefined') 
	{
		web3 = new Web3(web3.currentProvider);
	}
	else 
	{
		// Connect to the Azure Chain
		console.log("Initializing Web3 server...");
		web3 = new Web3(new Web3.providers.HttpProvider("http://40.68.223.124:8545"));

		if (web3.isConnected()) 
		{
			console.log("Server is connected!");
			console.log("Using Ethereum Javascript API version " + web3.version.api + "\n");
		}
		else
		{
			console.log("Server is NOT connected!");
		}		
	}
};

// here are the functions that will overwrite the basecontroller
EthereumController.prototype._getBlock = function (blockNumber) { 
	var retrievedBlock = web3.eth.getBlock(blockNumber);
	var transactions = [];
	
	if (retrievedBlock.transactions.length > 0) {	
		retrievedBlock.transactions.forEach(function (hash ) {
			var retrievedTransaction = web3.eth.getTransaction(hash);	
			var transaction = {
				from: retrievedTransaction.from,
				to: retrievedTransaction.to,
				timestamp: timeConverter(retrievedBlock.timestamp),
				value: retrievedTransaction.value.toNumber()			
			};	
			
			transactions.push(transaction);	
		});		
	}
	
	var block = { 
		number: blockNumber, 
		transactions: transactions, 
		timestamp: timeConverter(retrievedBlock.timestamp) 
	};

	return block;
};

EthereumController.prototype._getBlocks = function () { 
	var blocks = [];

	for (var i=0; i < 5; i++) {
		var transactions = [];
		var retrievedBlock = web3.eth.getBlock(web3.eth.blockNumber - i);
		
		if (retrievedBlock.transactions.length > 0) {	
			retrievedBlock.transactions.forEach(function (hash ) {
				var retrievedTransaction = web3.eth.getTransaction(hash);	
				var transaction = {
					from: retrievedTransaction.from,
					to: retrievedTransaction.to,
					timestamp: timeConverter(retrievedBlock.timestamp),
					blockNumber: retrievedBlock.number,
					value: retrievedTransaction.value.toNumber()			
				};	
				
				transactions.push(transaction);	
			});		
		}		
				
		var block = { 
			number: retrievedBlock.number, 
			transactions: transactions, 
			timestamp: timeConverter(retrievedBlock.timestamp)
		}
		
		blocks.push(block);		
	};

	return blocks;
};

EthereumController.prototype._getInfo = function () { 
	if (web3.isConnected()) {
		var networkStatus = "Online";	
	}
	else {
		var networkStatus = "Offline";
	}
	
	var totalSupply = 'NULL';
		
	var info = {
		network: networkStatus,
		totalMoney: totalSupply,
		currentBlockNumber: web3.eth.blockNumber,
		currentTime: moment().format('D MMM YYYY HH:m')
	};

	//console.log(info);
	return info;
};

EthereumController.prototype._getTransactions = function () { 

	web3.eth.filter('latest', function(error, result){
		if (!error)
			console.log(result);
	});

	web3.eth.getBlock(blockHashOrBlockNumber, true);



	var transaction = {
		from: "Piet",
		to: "Jan",
		value: 500,
		blockNumber: 123,
		timestamp: 1429287689
	};
	var transactions = [transaction, transaction, transaction, transaction, transaction];
	
	//console.log(transactions);
	return transactions;
};

EthereumController.prototype._getBalance = function (accountNumber) { 
	var balance = 32520;
	
	//console.log(balance);
	return balance;
};

EthereumController.prototype._getTransactionHistory = function (accountNumber) { 
	var transaction = {
		to: "Piet",
		block: "#1235",
		timestamp: 1429287689,
		amount: 123
	};
	var transactions = [transaction, transaction, transaction, transaction, transaction];
	
	//console.log("accountNumber: " + accountNumber);
	//console.log(transactions);
	return transactions;
};

EthereumController.prototype._sendTransaction = function (from, to, amount) { 
	//TODO
};

EthereumController.prototype._getAccountNumber = function () { 
	var accountNumber = "0xb9158Aad5E4e1a7BAa83840B499CFEd1c0730C0D";
	
	//console.log(accountNumber);
	return accountNumber;
};

// export all functions so they can be used by our app
module.exports = EthereumController;

/*
// Retrieve the latest (not empty) blocks 
// From these blocks, get the transaction(s)
// From this transaction, get From,To,Amount,Timestamp
app.get('/', function (req, res) {
   console.log("Received request.");
   var list = [];
   var y = 1;
   var i = 0;
   
   while (i < y)
   {
	      
   var transactionlist = web3.eth.getBlock(web3.eth.blockNumber - i).transactions;	
	
	// A lot of empty blocks show up -> Why?
	// To avoid this, we check if list of transactions is empty
	if(transactionlist.length > 0) {  
		console.log(transactionlist);
		var transaction = web3.eth.getTransaction(web3.eth.getBlock(web3.eth.blockNumber - i).blockNumber, 1);
		console.log(transaction);
		list.push(transaction);		
	}
	else {
		y = y + 1;	
	}
	
	i = i + 1;
   }
   
  
})
*/

/*

var currentBlockNumber = web3.eth.blockNumber;
console.log("Current BlockNumber: " + currentBlockNumber + "\n");

web3.eth.filter('pending').watch(function(error, result) 
{
  console.log("A transaction is pending! Waiting for it to confirm and be validated...");
});

web3.eth.filter('latest').watch(function(error, result) 
{
  var block = web3.eth.getBlock(result, true);

  console.log('block #' + block.number);
  console.dir(block.transactions);
});

*/