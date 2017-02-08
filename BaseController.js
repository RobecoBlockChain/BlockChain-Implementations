BaseController = function(){}

BaseController.prototype._init = function(){
 // this method must be overridden by the subclasses
};


// this is the init method that can be called by the app
// we do some logging 
// and then call the _init method 
// which will be overridden in the specific controller for a specific blockchain implementation
BaseController.prototype.init = function(){
 console.log("initializing the controller");
 this._init();
};


//
// TODO: here we add implementations for all functions we need
// a "normal"  function that can be called from our app 
// which does some basic logging and than calls the underscore function
//


module.exports = BaseController;