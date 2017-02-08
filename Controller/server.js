var http = require('http');
var Web3 = require('web3');
var express = require('express'); 
var path = require("path");
var app = express();

// We need to do this, so we can include the libraries 
// from the View folder
app.use(express.static(__dirname + '/../View'));

console.log("Initiating server...");

if (typeof web3 !== 'undefined') 
{
	web3 = new Web3(web3.currentProvider);
}
else 
{
	web3 = new Web3(new Web3.providers.HttpProvider("http://40.68.223.124:8545"));

	if (web3.isConnected()) 
	{
		console.log("Server is connected!");
		console.log("Using Ethereum Javascript API version " + web3.version.api);
	}
	else
	{
		console.log("Server is NOT connected!");
	}		
}

// Retrieve the latest (not empty) blocks 
// From these blocks, get the transaction(s)
// From this transaction, get From,To,Amount,Timestamp
app.get('/', function (req, res) {
   console.log("Received request.");
   var list = [];
   var y = 1;
   var i = 0;
   /*
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
   */
   
   res.sendFile(path.join(__dirname + '/../View/index.html'));
   //res.send(list);
})

var server = app.listen(8081, function () {
   var host = "localhost";
   var port = server.address().port;
   console.log("App listening at http://%s:%s", host, port);
})



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