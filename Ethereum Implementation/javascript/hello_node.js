
var http = require('http');
var Web3 = require('web3');
 
console.log("initiating"); 
 
if (typeof web3 !== 'undefined') {
  console.log("- existing provider"); 
  web3 = new Web3(web3.currentProvider);
} else {
  // set the provider you want from Web3.providers
  console.log("- new provider"); 
  web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  
  console.log("- connected is " + web3.isConnected());
} 
 
var coinbase = web3.eth.coinbase;
console.log("coinbase: " + coinbase);

var balance = web3.eth.getBalance(coinbase);
console.log("balance:  " + balance);
 

 
var server = http.createServer(function(req, res) {
  res.writeHead(200);
  res.end('Blockchain info : ' + web3.version.api);
});
server.listen(8080);
