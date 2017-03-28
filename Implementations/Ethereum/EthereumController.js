// the EthereumController is our ethereum subclass from BaseController
// here we implement all specific functions (that start with an underscore _)
// in the EthereumController we make use of the web3.js API
// See https://github.com/ethereum/wiki/wiki/JavaScript-API

var BaseController = require('../../Controllers/BaseController.js');
var util = require('util'); 
var Web3 = require('web3');
var moment = require('moment');
var Tx = require('ethereumjs-tx')

util.inherits(EthereumController, BaseController);
moment().format();


function printTransaction(txHash) {
  var tx = web3.eth.getTransaction(txHash);
  if (tx != null) {
    console.log("  tx hash          : " + tx.hash + "\n"
      + "   nonce           : " + tx.nonce + "\n"
      + "   blockHash       : " + tx.blockHash + "\n"
      + "   blockNumber     : " + tx.blockNumber + "\n"
      + "   transactionIndex: " + tx.transactionIndex + "\n"
      + "   from            : " + tx.from + "\n" 
      + "   to              : " + tx.to + "\n"
      + "   value           : " + tx.value + "\n"
      + "   gasPrice        : " + tx.gasPrice + "\n"
      + "   gas             : " + tx.gas + "\n"
      + "   input           : " + tx.input);
  }
}

function printBlock(block) {
  console.log("Block number     : " + block.number + "\n"
    + " hash            : " + block.hash + "\n"
    + " parentHash      : " + block.parentHash + "\n"
    + " nonce           : " + block.nonce + "\n"
    + " sha3Uncles      : " + block.sha3Uncles + "\n"
    + " logsBloom       : " + block.logsBloom + "\n"
    + " transactionsRoot: " + block.transactionsRoot + "\n"
    + " stateRoot       : " + block.stateRoot + "\n"
    + " miner           : " + block.miner + "\n"
    + " difficulty      : " + block.difficulty + "\n"
    + " totalDifficulty : " + block.totalDifficulty + "\n"
    + " extraData       : " + block.extraData + "\n"
    + " size            : " + block.size + "\n"
    + " gasLimit        : " + block.gasLimit + "\n"
    + " gasUsed         : " + block.gasUsed + "\n"
    + " timestamp       : " + block.timestamp + "\n"
    + " transactions    : " + block.transactions + "\n"
    + " uncles          : " + block.uncles);
    if (block.transactions != null) {
      console.log("--- transactions ---");
      block.transactions.forEach( function(e) {
        printTransaction(e);
      })
    }
}

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours().toString();
  var min = a.getMinutes().toString();
  var sec = a.getSeconds().toString();
  
  if (sec.length == 1) {	
		var sec = '0' + sec;  
  }

  if (min.length == 1) {	
		var min = '0' + min;  
  }

  if (hour.length == 1) {	
		var hour = '0' + hour;  
  }
  
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  return time;
}

/* For documentation on the three functions below, see             */
/* https://gist.github.com/ross-p/bd5d4258ac23319f363dc75c2b722dd9 */

let maxThreads = 50;

function scanBlockCallback(block, accountAddress, transactionHistory) {
    if (block.transactions) {
        for (var i = 0; i < block.transactions.length; i++) {
            var txn = block.transactions[i];		

			if (accountAddress != null) {	
				if (accountAddress.toLowerCase() == txn.from) {
					var transaction = {
					to: txn.to,
					block: txn.blockNumber,
					timestamp: timeConverter(block.timestamp),
					amount: (web3.fromWei(txn.value, 'ether') + ' ether')
					};					
					transactionHistory.push(transaction);		
				}
			}
			else {					
				var transaction = {
					from: txn.from,
					to: txn.to,
					blockNumber: txn.blockNumber,
					timestamp: timeConverter(block.timestamp),
					value: (web3.fromWei(txn.value, 'ether') + ' ether')
				};	
				transactionHistory.push(transaction);
			}
        }
    }
}

function scanBlockRange(startingBlock, stoppingBlock, accountAddress, callback) {
    let blockNumber = startingBlock,
        gotError = false,
        numThreads = 0,
		transactionHistory = []
        startTime = new Date();

    function getPercentComplete(bn) {
        var t = stoppingBlock - startingBlock,
            n = bn - startingBlock;
        return Math.floor(n / t * 100, 2);
    }

    function exitThread() {
        if (--numThreads == 0) {
            var numBlocksScanned = 1 + stoppingBlock - startingBlock,
                stopTime = new Date(),
                duration = (stopTime.getTime() - startTime.getTime())/1000,
                blocksPerSec = Math.floor(numBlocksScanned / duration, 2),
                msg = `Scanned to block ${stoppingBlock} (${numBlocksScanned} in ${duration} seconds; ${blocksPerSec} blocks/sec).`,
                len = msg.length,
                numSpaces = process.stdout.columns - len,
                spaces = Array(1+numSpaces).join(" ");

            process.stdout.write("\r"+msg+spaces+"\n");
            if (callback) {
				callback(gotError, transactionHistory);
            }
        }
        return numThreads;
    }

    function asyncScanNextBlock(accountAddress, transactionHistory) {
        if (gotError) {
            return exitThread();
        }
		
        if (blockNumber > stoppingBlock) {
            return exitThread();
        }

        var myBlockNumber = blockNumber++;

        if (myBlockNumber % maxThreads == 0 || myBlockNumber == stoppingBlock) {
            var pctDone = getPercentComplete(myBlockNumber);
            process.stdout.write(`\rScanning block ${myBlockNumber} - ${pctDone} %`);
        }

        web3.eth.getBlock(myBlockNumber, true, (error, block) => {
            if (error) {
                gotError = true;
                console.error("Error:", error);
            } else {
				scanBlockCallback(block, accountAddress, transactionHistory);
				asyncScanNextBlock(accountAddress, transactionHistory);
            }
        });
    }

    var nt;
    for (nt = 0; nt < maxThreads && startingBlock + nt <= stoppingBlock; nt++) {
        numThreads++;
        asyncScanNextBlock(accountAddress, transactionHistory);
    }

    return nt; 
}

/*    End of async block retrieving                  */

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
	var retrievedBlock = web3.eth.getBlock(blockNumber, true);
	var transactions = [];
	
	if (retrievedBlock.transactions.length > 0) {	
		retrievedBlock.transactions.forEach(function (retrievedTransaction ) {
			var transaction = {
				from: retrievedTransaction.from,
				to: retrievedTransaction.to,
				timestamp: timeConverter(retrievedBlock.timestamp),
				value: web3.fromWei(retrievedTransaction.value, "ether").toNumber() + ' ether'	
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
		/*
	web3.eth.defaultAccount = '0x8FDE5B5572fF1CA4a60a24CdB8169c16D071E787';
		
	var privateKey = new Buffer('1609741cd9ea824520bcb1d97bbf446f6fe12a960f0cf87a5fb97dccbf019c32', 'hex');
	
	// If you send a transaction, and it is not mined yet, the nonce will be the same as before.
	// How we fix this..
	var currentNonce = web3.eth.getTransactionCount(web3.eth.defaultAccount);
	console.log(currentNonce);
	
	var count = web3.eth.getTransactionCount(web3.eth.defaultAccount, "pending");
		console.log(count);
	
	var rawTx = {
	  nonce: web3.toHex(count + 1),
	  gas: web3.toHex(21000),
	  gasPrice: web3.toHex(20000000000), 
	  gasLimit:  web3.toHex(31500),
	  from: web3.eth.defaultAccount,
	  to: '0x6f0810052f8F3f1723B7D682a450EdF3BE371274', 
	  value: web3.toHex(web3.toWei(50, "ether"))
	}

	var tx = new Tx(rawTx);
	tx.sign(privateKey);

	var serializedTx = tx.serialize();
	
	
	web3.eth.sendRawTransaction(serializedTx.toString('hex'), function(err, address) {
	  if (!err) {
		console.log("\n Address: " + address);
		console.log("\nSuccessfully sent!"); 	
		
		count = web3.eth.getTransactionCount(web3.eth.defaultAccount, "pending");
		console.log(count);
	  }
	  else {
		console.log(err);	  
	  }
	});	
	*/
		
	var blocks = [];
	for (var i=0; i < 5; i++) {
		var transactions = [];
		var retrievedBlock = web3.eth.getBlock(web3.eth.blockNumber - i, true);
		
		if (retrievedBlock.transactions) {	
			retrievedBlock.transactions.forEach(function (retrievedTransaction) {
				var transaction = {
					from: retrievedTransaction.from,
					to: retrievedTransaction.to,
					timestamp: timeConverter(retrievedBlock.timestamp),
					blockNumber: retrievedBlock.number,
					value: web3.fromWei(retrievedTransaction.value, "ether").toNumber() + ' ether'			
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
	
	var totalSupply = 0;
	
	web3.eth.accounts.forEach( function(e){
		totalSupply = web3.eth.getBalance(e);
	})
		
	var totalSupply = Math.round(web3.fromWei(totalSupply, "ether")) + ' ether';
	
	var info = {
		network: networkStatus,
		totalMoney: totalSupply,
		currentBlockNumber: web3.eth.blockNumber,
		currentTime: moment().format('D MMM YYYY HH:mm')
	};

	//console.log(info);
	return info;
};

EthereumController.prototype._getTransactions = function (callback) { 	
	//206727 is 5 blocks ago
	scanBlockRange(web3.eth.blockNumber-4000, web3.eth.blockNumber, null, function(error, result) {		
		if (error)
			console.log(error);		

		callback(result.reverse());
	});
};

EthereumController.prototype._getBalance = function () { 
	var balance = web3.eth.getBalance(web3.eth.defaultAccount).toNumber();	
	balance = Number( (web3.fromWei(balance, "ether")*100) / 100 )  + ' Ether';
	
	return balance;
};

EthereumController.prototype._getTransactionHistory = function (callback) { 	
	scanBlockRange(web3.eth.blockNumber-4000, web3.eth.blockNumber, web3.eth.defaultAccount, function(error, result) {		
		if (error)
			console.log(error);		
		callback(result.reverse());
	});
};

EthereumController.prototype._sendTransaction = function (to, amount, privateKey) { 
	var privateKey = new Buffer(privateKey, 'hex');
	
	// Retrieving the latest pending transaction is bugged, see https://github.com/ethereum/go-ethereum/issues/2880
	// This means that we can only send a transaction, if the PREVIOUS transaction that we sent is mined
	var latestNonce = web3.eth.getTransactionCount(web3.eth.defaultAccount, "pending");
	console.log('Nonce: ' + latestNonce);	

	var rawTx = {
	  nonce: web3.toHex(latestNonce+1),
	  gas: web3.toHex(21000),
	  gasPrice: web3.toHex(20000000000), 
	  gasLimit:  web3.toHex(31500),
	  to: to, 
	  value: web3.toHex(web3.toWei(amount, "ether"))
	}
	
	var tx = new Tx(rawTx);
	tx.sign(privateKey);
	var serializedTx = tx.serialize();
	
	web3.eth.sendRawTransaction(serializedTx.toString('hex'), function(err, address) {
	  if (!err) {
		console.log("\nSuccessfully sent!"); 		
		console.log('\nTransaction address: ' + address);
		console.log('\nTransaction: \n' + printTransaction(address));
	  }
	  else {
		console.log(err);	  
	  }
	});	
	
};

EthereumController.prototype._setAccountNumber = function (accountNumber) { 
	web3.eth.defaultAccount = accountNumber;
};

// export all functions so they can be used by our app
module.exports = EthereumController;