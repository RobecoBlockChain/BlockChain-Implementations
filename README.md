# Ethereum

Functions for in the Controllers:

Admin
	getBlock(block ID) -> structuur terug met alle info
	getTransactions -> laatste 5
	getTransactions(block ID)
	getTransaction(trans ID)
	GetInfo()
		Name,Status,TotalAmount,BlockNumber ....

Wallet:	
	GetBalance(accountID)
	GetTransactionHistory(accountID) -> laatste 5
	SendTransaction(recipient address, amount)
	
	




To start the node.js server, our generic API, go in cmd to the /Controller folder.

Type: node server.js

This sets up a port that listens on http://localhost:8081/.

For now all the coding has been done in server.js, and we do not use the ethereumAPI.js file yet.

More documentation coming soon...
