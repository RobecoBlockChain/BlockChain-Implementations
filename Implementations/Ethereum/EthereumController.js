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

	//var transaction = web3.eth.getTransaction('0x4ec6e56d83bf6ce7ebfc065abebbfd8c0c78f702f568e55e8c24a2af70e31d08');
	
	//console.log(transaction.to);
	//console.log(transaction.from);
	//console.log(transaction.value);
	
	
	var privateKey = new Buffer('1609741cd9ea824520bcb1d97bbf446f6fe12a960f0cf87a5fb97dccbf019c32', 'hex');
	
	var rawTx = {
	  nonce: 'CX350',
	  gas: web3.toHex(25000),
	  gasPrice: web3.toHex(25000000000), 
	  gasLimit:  web3.toHex(3141592),
	  from: '0x8FDE5B5572fF1CA4a60a24CdB8169c16D071E787',
	  to: '0x6f0810052f8F3f1723B7D682a450EdF3BE371274', 
	  value: web3.toHex(web3.toWei(6, "ether")),
	  data: '0x19dacbf83c5de6658e14cbf7bcae5c15eca2eedecf1c66fbca928e4d351bea0f'
	}

	var tx = new Tx(rawTx);
	tx.sign(privateKey);

	var serializedTx = tx.serialize();
	
	/*
	web3.eth.sendRawTransaction(serializedTx.toString('hex'), function(err, address) {
	  if (!err) {
		console.log("\n Address: " + address);
		console.log("\nSuccessfully sent!"); 	
	  }
	  else {
		console.log(err);	  
	  }
	});	
	*/
	
	
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
	var privateKey = new Buffer(privateKey, 'hex');

	var rawTx = {
	  nonce: '0x00',
	  gasPrice: '0x09184e72a000', 
	  gasLimit: '0x2710',
	  to: to, 
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
	
	/*
	var transaction = {
		from: web3.eth.defaultAccount,
		to: to,
		value: web3.toWei(amount, "ether")			
	};	
	
	web3.eth.sendTransaction({transaction}, function(err, address) {
	  if (!err) {
		console.log(address);
		console.log("\nSuccessfully sent!"); 	
	  }
	});
	*/
	/*
	var Transaction = require('../index.js')

	// create a blank transaction
	var tx = new Transaction(null, 1) // mainnet Tx EIP155

	// So now we have created a blank transaction but Its not quiet valid yet. We
	// need to add some things to it. Lets start:
	// notice we don't set the `to` field because we are creating a new contract.
	tx.nonce = 0
	tx.gasPrice = 100
	tx.gasLimit = 1000
	tx.value = 0
	tx.data = '0x7f4e616d65526567000000000000000000000000000000000000000000000000003057307f4e616d6552656700000000000000000000000000000000000000000000000000573360455760415160566000396000f20036602259604556330e0f600f5933ff33560f601e5960003356576000335700604158600035560f602b590033560f60365960003356573360003557600035335700'

	var privateKey = new Buffer('e331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109', 'hex')
	tx.sign(privateKey)
	// We have a signed transaction, Now for it to be fully fundable the account that we signed
	// it with needs to have a certain amount of wei in to. To see how much this
	// account needs we can use the getUpfrontCost() method.
	var feeCost = tx.getUpfrontCost()
	tx.gas = feeCost
	console.log('Total Amount of wei needed:' + feeCost.toString())

	// if your wondering how that is caculated it is
	// bytes(data length) * 5
	// + 500 Default transaction fee
	// + gasAmount * gasPrice

	// lets serialize the transaction

	console.log('---Serialized TX----')
	console.log(tx.serialize().toString('hex'))
	console.log('--------------------')

	// Now that we have the serialized transaction we can get AlethZero to except by
	// selecting debug>inject transaction and pasting the transaction serialization and
	// it should show up in pending transaction.

	// Parsing & Validating transactions
	// If you have a transaction that you want to verify you can parse it. If you got
	// it directly from the network it will be rlp encoded. You can decode you the rlp
	// module. After that you should have something like
	var rawTx = [
	  '0x00',
	  '0x09184e72a000',
	  '0x2710',
	  '0x0000000000000000000000000000000000000000',
	  '0x00',
	  '0x7f7465737432000000000000000000000000000000000000000000000000000000600057',
	  '0x1c',
	  '0x5e1d3a76fbf824220eafc8c79ad578ad2b67d01b0c2425eb1f1347e8f50882ab',
	  '0x5bd428537f05f9830e93792f90ea6a3e2d1ee84952dd96edbae9f658f831ab13'
	]

	var tx2 = new Transaction(rawTx)

	// Note rlp.decode will actully produce an array of buffers `new Transaction` will
	// take either an array of buffers or an array of hex strings.
	// So assuming that you were able to parse the tranaction, we will now get the sender's
	// address

	console.log('Senders Address: ' + tx2.getSenderAddress().toString('hex'))

	// Cool now we know who sent the tx! Lets verfy the signature to make sure it was not
	// some poser.

	if (tx2.verifySignature()) {
	  console.log('Signature Checks out!')
	}

	// And hopefully its verified. For the transaction to be totally valid we would
	// also need to check the account of the sender and see if they have at least
	// `TotalFee`.
	*/
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
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