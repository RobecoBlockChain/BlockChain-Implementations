var express = require('express'); 
var dummyController = require('./Controllers/DummyController.js');
var controller = require('./Implementations/Ethereum/EthereumController.js');
var bodyParser = require('body-parser')
var opn = require('opn');
var c = new controller();
var app = express();

console.log("Setting up port...");

app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/Views"), bodyParser.urlencoded({ extended: false }));

// Save the accountnumber for later use
var defaultAccountNumber = "";

// retrieves values for the Admin Page
app.get('/', function(req, res) {
	c.init();
	var blocks = c.getBlocks(); 
	var info = c.getInfo();
	c.getTransactions(function(result) {
		console.log('Done retrieving transactions!');
		res.render('index', {
			blocks: blocks,
			info: info,
			transactions: result
		});	
	});
});

// responds to the post that is triggered on the Admin Page
// when the user wants to find a block address
app.post('/getBlock', function(req, res) {
	var block = c.getBlock(req.body.blockNumber);
	
	console.log('Done!');
	res.send(block);	
});

// responds to the post that is triggered on the Wallet Page
// when the user fills in his account number
app.post('/getAccount', function(req, res) {
	var defaultAccount = c.setAccountNumber(req.body.accountNumber);
	var	accountNumber = req.body.accountNumber;
	var	balance = c.getBalance();
	
	c.getTransactionHistory(function(result) {
		console.log('Done!');	
		var resultData = {
			accountNumber: accountNumber,
			balance: balance,
			transactionHistory: result
		};
		
		res.send(resultData);
	});
});

// responds to the post that is triggered on the Wallet Page
// when the user sends a transaction
app.post('/sendTransaction', function(req, res) {
	c.sendTransaction(req.body.to, req.body.amount, req.body.privateKey);
	console.log('Done!');
});

app.listen(8080);
console.log('8080 is the magic port.');
console.log('-----------------------');