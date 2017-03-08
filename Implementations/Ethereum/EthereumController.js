// the EthereumController is our first subclass from BaseController
// here we implement all specific functions (that start with an underscore _)
// in the EthereumController we obviously do not implement much
// just some logging and returning some basic values and dummy lists

// later on we create real Controllers. One for each blockchain implementation

var BaseController = require('../../Controllers/BaseController.js');
var util = require('util'); 

// constructor
function EthereumController() {
    BaseController.apply(this, arguments);
}

// we let the EthereumController inherit from BaseController
util.inherits(EthereumController, BaseController);

EthereumController.prototype._init = function () { 
	// here comes the code for initializing our blockchain
	console.log("Ethereum initialization..." );
};

// here are the functions that will overwrite the basecontroller
EthereumController.prototype._getBlock = function (blockNumber) { 
	var transaction = {
		from: "Piet",
		to: "Jan",
		timestamp: 1429287689,
		value: 500
		
	};
	var transactions = [transaction, transaction];
	
	var block = { 
		number: blockNumber, 
		transactions: transactions, 
		timestamp: 1429287689 
	};
	
	//console.log(block);
	return block;
};

EthereumController.prototype._getBlocks = function () { 
	var transaction = {
		from: "Piet",
		to: "Jan",
		blockNumber: 123,
		timestamp: 1429287689,
		value: 500
		
	};
	var transactions = [transaction, transaction];
	
	 var blocks = [
        { number: 121, transactions: transactions, timestamp: 1429287689 },
        { number: 122 ,transactions: transactions, timestamp: 1429287688 },
		{ number: 123 ,transactions: transactions, timestamp: 1429287688 },
		{ number: 124 ,transactions: transactions, timestamp: 1429287688 },
        { number: 125 ,transactions: transactions, timestamp: 1429287686 }
    ];

	//console.log(blocks);
	return blocks;
};

EthereumController.prototype._getInfo = function () { 
	var info = {
		network: "Online",
		totalMoney: 1000000,
		currentBlockNumber: 125,
		currentTime: new Date().toISOString(),
	};

	//console.log(info);
	return info;
};

EthereumController.prototype._getTransactions = function () { 
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