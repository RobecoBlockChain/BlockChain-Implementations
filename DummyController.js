// the DummyController is our first subclass from BaseController
// here we implement all specific functions (that start with an underscore _)
// in the DummyController we obviously do not implement much
// just some logging and returning some basic values and dummy lists

// later on we create real Controllers. One for each blockchain implementation

var BaseController = require('./BaseController.js');
var util = require('util'); 

// constructor
function DummyController() {
    BaseController.apply(this, arguments);
}

// we let the DummyController inherit from BaseController
util.inherits(DummyController, BaseController);


// override the _init function to actually so something usefull
DummyController.prototype._init = function () { 
	// here comes the code for initializing our blockchain
	console.log(" DUMMY initialization " );
};


// override the _getBlocks function to actually so something usefull
DummyController.prototype._getBlocks = function () { 
	// here comes the code for initializing our blockchain
	console.log(" getting the blocks " );
	
	var blocks = [
    "blokje 1",
    "blokje 2",
    "blokje 3"
    ];
	
	console.log(blocks);
	return blocks;
};


//
//  TODO: here we add implementations for all underscore functions we need
//


// export all functions so they can be used by our app
module.exports = DummyController;


