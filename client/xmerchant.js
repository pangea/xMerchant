(function(){
  "use strict";
  
  function XMerchant(){
  }

  XMerchant.prototype.setGateway = function(gateway){
    this.gateway = gateway;
  };

  /**
   * Make a payment
   * @param {Object} data 
   * @param {function} callback
   */
  XMerchant.prototype.pay = function(data,callback){
    if (!data.type){
      throw "Must specify a type";
    }

    this.gateway.pay(data,callback);
  };

  /*
   refund data:
   fullName,
   refNum,
   amount
   */
  XMerchant.prototype.refund = function(data,callback){
    this.gateway.refund(data,callback);
  };

  /**
   * 
   * @return {Array<Object>} Array of plan objects.
   */
  XMerchant.prototype.getRecurringPayments = function(custId,callback){
    this.gateway.getRecurringPayments(custId);
  };

  module.exports = XMerchant;
})();
