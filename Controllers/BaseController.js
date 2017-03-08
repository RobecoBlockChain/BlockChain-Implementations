// this is the basecontroller where we do some basic
// logging and handle the calls we get from the server.
// from here we call the methods that we use from the
// subclasses for each of the the blockchain implementations

BaseController = function(){}

// methods below need to be overwritten by the subclasses
BaseController.prototype._init = function(){
	throw "NotImplementedException";
};

BaseController.prototype._getTransactions = function(){
	throw "NotImplementedException";
};

BaseController.prototype._getBlocks = function(){
	throw "NotImplementedException";
};

BaseController.prototype._getBlock = function(blockNumber){	
	throw "NotImplementedException";
};

BaseController.prototype._getInfo = function(){
	throw "NotImplementedException";
};

BaseController.prototype._getBalance = function(accountNumber){	
	throw "NotImplementedException";
};

BaseController.prototype._getTransactionHistory = function(accountNumber){
	throw "NotImplementedException";
};

BaseController.prototype._sendTransaction = function(from, to, amount){
	throw "NotImplementedException";
};

BaseController.prototype._getAccountNumber = function(){
	throw "NotImplementedException";
};

// methods below call the above methods that are overwritten by the subclasses
BaseController.prototype.init = function(){
	console.log("\nInitializing the controller...\n");
	this._init();
};

BaseController.prototype.getBlocks = function(){
	/*
	var transaction = {
		from: string,
		to: string,
		timestamp: timestamp,
		value: int	
	};
	
	/*
	var block = { 
		number: INT, 
		transactions: list<transaction>, 
		timestamp: INT
	};
	
	Should Return an array of block objects.
	*/
	
	console.log("Retrieving five latest blocks...");
	return(this._getBlocks());
};

BaseController.prototype.getBlock = function(blockNumber){
	/*
	var transaction = {
		from: string,
		to: string,
		timestamp: timestamp,
		value: int	
	};
	
	var block = { 
		number: INT, 
		transactions: list<transaction>, 
		timestamp: INT
	};
	
	Returns a block object.
	*/
	
	console.log("Retrieving block...");
	return(this._getBlock(blockNumber));
};

BaseController.prototype.getTransactions = function(){
	/*
	var transaction = {
		from: string,
		to: string,
		timestamp: timestamp,
		value: int	
	};
	
	Returns an array of transaction objects.
	*/
	
	console.log("Retrieving five latest transactions...");
	return(this._getTransactions());
};

BaseController.prototype.getInfo = function(){
	/*
	var info = {
		network: string,
		totalMoney: int,
		currentBlockNumber: int,
		currentTime: dateTime,
	};
	
	Returns an info object.
	*/
	
	console.log("Retrieving info...");
	return(this._getInfo());
};

BaseController.prototype.getBalance = function(accountNumber){
	/*
	Returns a string.
	*/
	
	console.log("\nRetrieving balance...");
	return(this._getBalance(accountNumber));
};

BaseController.prototype.getTransactionHistory = function(accountNumber){
	/*
	var transaction = {
		to: string,
		block: int,
		timestamp: timestamp,
		amount: int
	};
	
	Returns an array of transaction objects.
	*/
	
	console.log("Retrieving transaction history...");
	return(this._getTransactionHistory(accountNumber));
};

BaseController.prototype.sendTransaction = function(from, to, amount){
	console.log("Sending transaction...");
	return(this._sendTransaction(from, to, amount));
};

BaseController.prototype.getAccountNumber = function(){
	/*
	Returns a string.	
	*/
	
	console.log("Retrieving account number...");
	return(this._getAccountNumber());
};

module.exports = BaseController;