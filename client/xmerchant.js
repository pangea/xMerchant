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
   * @param {function} callback First parameter is a hash including
   * pertinant information such as the paymentId, planId, and status messages
   */
  XMerchant.prototype.pay = function(data,callback){
    if (!data.type){
      throw "Must specify a type";
    }

    this.gateway.pay(data,callback);
  };

  /**
   * refunds the payment specified by the paymentId by the amount specified.
   *   paymentId's are returned in the results hash after calling "pay"
   * @param {string} paymentId
   * @param {string} amount
   * @param {function} callback
   */
  XMerchant.prototype.refund = function(paymentId,amount,callback){
    this.gateway.refund(paymentId,amount,callback);
  };

  /**
   * Searches for payment plans using the params provided
   *  supports custId, amount (no trailing zeros), start (YYYY-MM-DD) params. 
   * @return {Array<Object>} Array of plan objects.
   */
  XMerchant.prototype.searchRecurringPayments = function(params,callback){
    if( !(params.custId || params.amount || params.start) ){
      throw("Must have search query params");
    }

    this.gateway.searchRecurringPayments(params,callback);
  };

  /**
   * Searches for payments using the params provided
   *  supports custId, amount (no trailing zeros), date (YYYY-MM-DD) params. 
   * @return {Array<Object>} Array of plan objects.
   */
  XMerchant.prototype.searchPayments = function(params,callback){
    if( !(params.custId || params.amount || params.date) ){
      throw("Must have search query params");
    }

    this.gateway.searchPayments(params,callback);
  };

  /** 
   * Cancels a recurring payment plan by the planId
   */
  XMerchant.prototype.cancelRecurringPayment = function(planId,callback){
    this.gateway.cancelRecurringPayment(planId,callback);
  };

  module.exports = XMerchant;
})();
