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

function scanTransactionCallback(txn, block) {
    if (txn.to === web3.eth.defaultAccount) {
        // A transaction credited ether into this wallet
        var ether = web3.fromWei(txn.value, 'ether');
		 console.log(`\r${block.timestamp} +${ether} from ${txn.from}`);
    } 
	else if (txn.from === web3.eth.defaultAccount) {
        // A transaction debitted ether from this wallet
        var ether = web3.fromWei(txn.value, 'ether');
		console.log(`\r${block.timestamp} -${ether} to ${txn.to}`);
    }
}

function scanBlockCallback(block, transactionHistory) {
    if (block.transactions) {
        for (var i = 0; i < block.transactions.length; i++) {
            var txn = block.transactions[i];
			console.log('\nFound one... ');
			
			var transaction = {
				to: txn.to,
				block: txn.blockNumber,
				timestamp: txn.timestamp,
				amount: txn.value
			};			
			
			console.log(transaction);
			transactionHistory.push(transaction);
			
            scanTransactionCallback(txn, block);
        }
    }
}

function scanBlockRange(startingBlock, stoppingBlock, callback, transactionHistory) {

    let blockNumber = startingBlock,
        gotError = false,
        numThreads = 0,
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
                callback(gotError, stoppingBlock);
            }
        }
        return numThreads;
    }

    function asyncScanNextBlock(transactionHistory) {
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
                scanBlockCallback(block, transactionHistory);
                asyncScanNextBlock(transactionHistory);
            }
        });
    }

    var nt;
    for (nt = 0; nt < maxThreads && startingBlock + nt <= stoppingBlock; nt++) {
        numThreads++;
        asyncScanNextBlock(transactionHistory);
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
	var blocks = [];
		
	//var pendingBlock = web3.eth.getBlock('pending');
	//printBlock(pendingBlock);
	
	web3.eth.defaultAccount = '0x8FDE5B5572fF1CA4a60a24CdB8169c16D071E787';
		
	var privateKey = new Buffer('1609741cd9ea824520bcb1d97bbf446f6fe12a960f0cf87a5fb97dccbf019c32', 'hex');
	var currentNonce = web3.eth.getTransactionCount(web3.eth.defaultAccount);
	console.log(currentNonce);
	
	var rawTx = {
	  nonce: web3.toHex(currentNonce + 1),
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
		var pendingBlock = web3.eth.getBlock('pending');
		printBlock(pendingBlock);
	  }
	  else {
		console.log(err);	  
	  }
	});	
	

	
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

EthereumController.prototype._getBalance = function () { 
	var balance = web3.eth.getBalance(web3.eth.defaultAccount).toNumber();	
	balance = Number( (web3.fromWei(balance, "ether")*100) / 100 )  + ' Ether';
	
	return balance;
};

EthereumController.prototype._getTransactionHistory = function () { 	

	//var transactionHistory = [];
		
	//scanBlockRange(web3.eth.blockNumber-300, web3.eth.blockNumber, null, transactionHistory);
	
	//console.log(transactionHistory);
	
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

EthereumController.prototype._sendTransaction = function (to, amount, privateKey) { 
	var privateKey = new Buffer('1609741cd9ea824520bcb1d97bbf446f6fe12a960f0cf87a5fb97dccbf019c32', 'hex');

	var rawTx = {
	  nonce: web3.toHex(5),
	  gasPrice: '0x09184e72a000', 
	  gasLimit: '0x2710',
	  to: '0x6f0810052f8F3f1723B7D682a450EdF3BE371274', 
	  value: '0x01',
	  data: '0x7f7465737432000000000000000000000000000000000000000000000000000000600057'
	}

	var tx = new Tx(rawTx);
	tx.sign(privateKey);

	var serializedTx = tx.serialize();
	console.log(serializedTx.toString('hex'));
	
	web3.eth.sendRawTransaction(serializedTx.toString('hex'), function(err, address) {
	  if (!err) {
		console.log(address);
		console.log("\nSuccessfully sent!"); 	
	  }
	  else {
		console.log("Error: " + err);	  
	  }
	});

	
};

EthereumController.prototype._setAccountNumber = function (accountNumber) { 
	web3.eth.defaultAccount = accountNumber;
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