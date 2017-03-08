var Web3 = require('web3');
var express = require('express'); 
var dummyController = require('./Controllers/DummyController.js');
var controller = require('./Implementations/Ethereum/EthereumController.js');
var bodyParser = require('body-parser')
var c = new controller();
var app = express();

console.log("Initiating server...");

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/Views"), bodyParser.urlencoded({ extended: false }));

// Save the accountnumber for later use
var defaultAccountNumber = "";

// retrieves values for the Admin Page
app.get('/', function(req, res) {
	var blocks = c.getBlocks(); 
	var info = c.getInfo();
	var transactions = c.getTransactions();
	
    res.render('index', {
        blocks: blocks,
		info: info,
		transactions: transactions
    });
});

// responds to the post that is triggered on the Admin Page
// when the user wants to find a block address
app.post('/getBlock', function(req, res) {
	var block = c.getBlock(req.body.blockNumber);
	
	res.send(block);	
});

// responds to the post that is triggered on the Wallet Page
// when the user fills in his account number
app.post('/getAccount', function(req, res) {
	defaultAccountNumber = req.body.accountNumber;

	var resultData = {
		accountNumber: defaultAccountNumber,
		balance: c.getBalance(),
	    transactionHistory: c.getTransactionHistory(defaultAccountNumber)
	};
	
	res.send(resultData);
});

// responds to the post that is triggered on the Wallet Page
// when the user sends a transaction
app.post('/getAccount', function(req, res) {
	//sendTransaction(from, to, amount)
	//TODO
});

app.listen(8080);
console.log('8080 is the magic port.');

/*
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
*/



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
   
   
   res.sendFile(path.join(__dirname + '/../View/index.html'));
   //res.send(list);
})
*/

/*
var server = app.listen(8081, function () {
   var host = "localhost";
   var port = server.address().port;
   console.log("App listening at http://%s:%s", host, port);
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