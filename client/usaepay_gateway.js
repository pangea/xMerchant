(function(){
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest,
      helpers = require("./helpers"),
      soap = require('soap'),
      //SANDBOX
      // soapUrl = "https://sandbox.usaepay.com/soap/gate/293C8EBA/usaepay.wsdl";
      //PROD
      soapUrl = "https://www.usaepay.com/soap/gate/293C8EBA/usaepay.wsdl";
  
  function UsaepayGateway(){
  }

  UsaepayGateway.prototype.key = function(key){
    this.UMkey = key;
  };

  UsaepayGateway.prototype.pin = function(pin){
    this.pin = pin;
  };

  /**
   * Gets the sha hash based on the Source Key, seed, and pin
   * @return {Object} contains both seed and hash
   */
  UsaepayGateway.prototype.getShaHash = function(){
    // get the sha hash from key, seed, and pin
    var seed = Math.round(parseFloat(helpers.random(1))*1000),
        clear = this.UMkey + seed + this.pin,
        crypto = require('crypto'),
        shasum = crypto.createHash('sha1');
    shasum.update(clear);

    
    return {seed: seed, hash: shasum.digest('hex')};
  };

  /**
   * appends our auth token to your args, calls the queryFunction through soap,
   * then passes any errors and the results to the callback function
   */ 
  UsaepayGateway.prototype.makeSoapQuery = function(args, queryFunction,callback){
    var shaHash = this.getShaHash();

    args.Token = {
      theAttrs: {'xsi:type':"ns1:ueSecurityToken"},
      SourceKey: this.UMkey,
      PinHash: {
        Type: 'sha1',
        Seed: shaHash.seed,
        HashValue: shaHash.hash
      }
    };
    var wsdlOptions = {
      attributesKey: 'theAttrs',
      // endpoint: "https://sandbox.usaepay.com/soap/gate/DFBAABC3"
    };
    console.log(args);
    soap.createClient(soapUrl, wsdlOptions, function (err, client) {
      client.usaepayService.ueSoapServerPort[queryFunction](args,function(err,result){
        if (err){
          throw(err);
        }
        else{
          console.log(result);
          callback(result);
        }
      });
    });    
  };

  UsaepayGateway.prototype.normalizeRecurringPayment = function(responses){
    var ret = [];
    // Check if there is a result
    if (responses[0]){
      responses.forEach(function(response){
        ret.push({
          planId: response.CustNum.$value,
          custId: response.CustomerID.$value,
          amount: response.Amount.$value,
          number: response.NumLeft.$value,
          start: response.Created.$value,
          next: response.Next.$value,
          billing: {
            fullName: response.BillingAddress.FirstName.$value + " " + 
              response.BillingAddress.LastName.$value,
            street: response.BillingAddress.Street.$value,
            street2: response.BillingAddress.Street2.$value,
            city: response.BillingAddress.City.$value,
            state: response.BillingAddress.State.$value,
            zip: response.BillingAddress.Zip.$value, 
            email: response.BillingAddress.Email.$value
          }
        });
      });
    }
    return ret;
  };

  UsaepayGateway.prototype.searchRecurringPayments= function(params,callback){
    var searchParams = [];
    if (params.custId){
      searchParams.push({
        Field: "CustomerID",
        Type: "eq",
        Value: params.custId
      });
    }
    if (params.amount){
      searchParams.push({
        Field: "Amount",
        Type: "eq",
        Value: params.amount
      });
    }
    if (params.start){
      searchParams.push({
        Field: "Created",
        Type: "contains",
        Value: params.start
      });
    }

    var args = {
      Search: searchParams,
      MatchAll: true,
      Start: 0,
      Limit: 100,
      Sort: "Created"
    };
    
    var that = this;
    this.makeSoapQuery(args,"searchCustomers",function(result){
      var recurringPayments = result.searchCustomersReturn.Customers.item,
          response;
      // normalizeRecurringPayment expects an array of individual customer 
      // responses. If there's only a single customer, usaepay doesn't put it in
      // an array.
      if ( !(recurringPayments instanceof Array) ){
        recurringPayments = [recurringPayments];
      }

      response = that.normalizeRecurringPayment(recurringPayments);
      callback(response);
    });
  };

  UsaepayGateway.prototype.normalizePayment = function(responses){
    var ret = [],
        that = this,
        i = 0;

    // Check if there is a result
    if (responses[0]){
      responses.forEach(function(response){
        ret.push({
          custId: response.CustomerID.$value,
          amount: response.Response.AuthAmount.$value,
          date: response.DateTime.$value
        });

        if (response.BillingAddress.FirstName){
          ret[i].billing = {
            fullName: response.BillingAddress.FirstName.$value + " " + 
              response.BillingAddress.LastName.$value,
            street: response.BillingAddress.Street.$value,
            street2: response.BillingAddress.Street2.$value,
            city: response.BillingAddress.City.$value,
            state: response.BillingAddress.State.$value,
            zip: response.BillingAddress.Zip.$value, 
            email: response.BillingAddress.Email.$value
          };
        }

        helpers.merge(ret[i],that.normalizePaymentResponse(response.Response));
        i++;
      });
    }
    return ret;
  };

  UsaepayGateway.prototype.searchPayments= function(params,callback){
    var searchParams = [];
    if (params.custId){
      searchParams.push({
        Field: "CustomerID",
        Type: "eq",
        Value: params.custId
      });
    }
    if (params.amount){
      searchParams.push({
        Field: "Amount",
        Type: "eq",
        Value: params.amount
      });
    }
    if (params.date){
      searchParams.push({
        Field: "Created",
        Type: "contains",
        Value: params.date
      });
    }

    var args = {
      Search: searchParams,
      MatchAll: true,
      Start: 0,
      Limit: 100,
      Sort: "Created"
    };
    
    var that = this;
    this.makeSoapQuery(args,"searchTransactions",function(result){
      var payments = result.searchTransactionsReturn.Transactions.item,
          response;
      // normalizePayment expects an array of individual customer 
      // responses. If there's only a single customer, usaepay doesn't put it in
      // an array.
      if ( !(payments instanceof Array) ){
        payments = [payments];
      }

      response = that.normalizePayment(payments);
      callback(response);
    });
  };

  /** 
   * Cancels a recurring payment by the planId
   */
  UsaepayGateway.prototype.cancelRecurringPayment = function(planId,callback){
    var args = {
      CustNum: planId
    };

    this.makeSoapQuery(args,"deleteCustomer",function(result){
      callback(result.deleteCustomerReturn.$value);
    });
  };

  /**
   * Filters the PaySimple specific response to fit the naming conventions of
   * the xmerchant interface
   * @param {hash} response
   * @return {hash} normalizedResponse
   */
  UsaepayGateway.prototype.normalizeCreditResponse = function(response){
    return {
      status: response.UMstatus,
      authCode: response.UMauthCode,
      avsCode: response.UMavsResultCode,
      cvvCode: response.UMcvv2ResultCode,
      vpasCode: response.UMvpasResultCode.$value,
      result: response.UMresult,
      error: response.UMerror,
      errorCode: response.UMerrorcode,
      refNum: response.UMrefNum
    };
  };

  /**
   * Filters the PaySimple specific response to fit the naming conventions of
   * the xmerchant interface
   * @param {hash} response
   * @return {hash} normalizedResponse
   */
  UsaepayGateway.prototype.normalizeCheckResponse = function(response){
    return {
      refNum: response.UMrefNum,
      status: response.UMstatus,
      authCode: response.UMauthCode,
      result: response.UMresult,
      error: response.UMerror,
      errorCode: response.UMerrorcode
    };
  };

  /**
   * Filters the PaySimple specific response to fit the naming conventions of
   * the xmerchant interface
   * @param {hash} response
   * @return {hash} normalizedResponse
   */
  UsaepayGateway.prototype.normalizeRefundResponse = function(response){
    return {
      status: response.UMstatus,
      authCode: response.UMauthCode,
      result: response.UMresult,
      error: response.UMerror,
      errorCode: response.UMerrorcode
    };
  };

  /**
   * Takes the paysimple payment response object and converts it into a generic,
   * normalized form to match the XMerchant interface.
   */
  UsaepayGateway.prototype.normalizePaymentResponse = function(response){
    return {
      status: response.StatusCode.$value,
      result: response.ResultCode.$value,
      paymentId: response.RefNum.$value,
      planId: response.CustNum.$value,
      avs: response.AvsResult.$value,
      avsCode: response.AvsResultCode.$value,
      cvv2: response.CardCodeResult.$value,
      cvv2Code: response.CardCodeResultCode.$value,
      vpasCode: response.VpasResultCode.$value,
      error: response.Error.$value,
      errorCode: response.ErrorCode.$value
    };
  };

  /**
   * Takes the paysimple payment response object and converts it into a generic,
   * normalized form to match the XMerchant interface.
   */
  UsaepayGateway.prototype.normalizeAddCustomerResponse = function(response){
    return {
      planId: response.$value
    };
  };

  UsaepayGateway.prototype.addCustomer = function(data,callback){
    var args = {
      CustomerData: {
        theAttrs: { 'xsi:type':"ns1:CustomerObject" },
        CustomerID: data.custId,
        BillingAddress: {
          theAttrs: { 'xsi:type':"ns1:Address" },
          FirstName: data.billing.fullName.split(' ').slice(0, -1).join(' '),
          LastName: data.billing.fullName.split(' ').slice(-1).join(' '),
          Street: data.billing.street,
          Street2: data.billing.street2,
          City: data.billing.city,
          State: data.billing.state,
          Zip: data.billing.zip,
          Country: "United States",
          Email: data.billing.email
        },
        PaymentMethods: {
          theAttrs: { 
            'xsi:type':"ns1:PaymentMethodArray"
          },          
          item: []
        }
      }
    };
    if (data.type === "ach"){
      this.addCustomerACHData(args,data);
    } else if (data.type === "credit"){
      this.addCustomerCreditData(args,data);
    } else{
      throw "Type" + data.type + "is not supported by this gateway";
    }
    if (data.recurrence){
      args.CustomerData.Enabled = true;
      args.CustomerData.Schedule = data.recurrence.schedule;
      args.CustomerData.Next = data.recurrence.start;
      args.CustomerData.NumLeft = data.recurrence.number;
      args.CustomerData.Amount = data.amount;
      args.CustomerData.SendReceipt = true;
    }

    var that = this,
        result;
    
    this.makeSoapQuery(args,"addCustomer",function(result){ 
      result = that.normalizeAddCustomerResponse(result.addCustomerReturn);
      callback(result);
    });
  };

  UsaepayGateway.prototype.quickUpdateCustomer = function(data,callback){
    console.log("############");
    console.log("quickUpdateCustomer Data");
    console.log(data);
    console.log("############");    
    var args = {
      CustNum: data.CustNum,
      UpdateData: {
        theAttrs: { 
          'xsi:type':"ns1:FieldValueArray"
        },          
        item: []
      }
    };

    for (var k in data){
      if (data.hasOwnProperty(k) && k !== "CustNum") {
        args.UpdateData.item.push(
          { 
            theAttrs: { 'xsi:type':"ns1:FieldValue" },
            Field: k, 
            Value: data[k]
          }
        );
      }
    }

    var that = this,
        result;
    console.log("############");
    console.log("quickUpdateCustomer Args");
    console.log(args);
    console.log("############");        
    this.makeSoapQuery(args,"quickUpdateCustomer",function(result){ 
      result = that.normalizeAddCustomerResponse(result);
      if(callback){
        callback(result);
      }
    });
  };

  UsaepayGateway.prototype.pay = function(data,callback){
    console.log(data);
    var args = {
      Parameters: {
        theAttrs: { 'xsi:type':"ns1:TransactionRequestObject" },
        AccountHolder: data.billing.fullName,
        CustomerID: data.custId,
        CustReceipt: true,
        Details: {
          theAttrs: { 'xsi:type':"ns1:TransactionDetail" },
          Amount: data.amount
        },
        BillingAddress: {
          theAttrs: { 'xsi:type':"ns1:Address" },
          FirstName: data.billing.fullName.split(' ').slice(0, -1).join(' '),
          LastName: data.billing.fullName.split(' ').slice(-1).join(' '),
          Street: data.billing.street,
          Street2: data.billing.street2,
          City: data.billing.city,
          State: data.billing.state,
          Zip: data.billing.zip,
          Country: "United States",
          Email: data.billing.email
        }
      }
    };
    if (data.type === "ach"){
      this.addTransactionACHData(args,data);
    } else if (data.type === "credit"){
      this.addTransactionCreditData(args,data);
    } else{
      throw "Type" + data.type + "is not supported by this gateway";
    }
    if (data.recurrence){
      args.Parameters.RecurringBilling =  {
        Schedule: data.recurrence.schedule,
        Next: data.recurrence.start,
        NumLeft: data.recurrence.number,
        Amount: data.amount,
        Enabled: true
      };
    }
    
    var that = this,
        result;

    this.makeSoapQuery(args,"runTransaction",function(result){ 
      result = that.normalizePaymentResponse(result.runTransactionReturn);     
      callback(result);
    });
  };
  
  UsaepayGateway.prototype.refund = function(paymentId,amount,callback){
    var args = {
      RefNum: paymentId,
      Amount: amount
    };

    var that = this;
    this.makeSoapQuery(args,"refundTransaction",function(result){
      callback(that.normalizePaymentResponse(result.refundTransactionReturn));
    });
  };

  /**
   * Adds credit card information to the given SOAP args using the data provided
   * @param {Object} args pre formatted SOAP object with 
   *   params:
   *      AccountHolder, Details, RecurringBilling
   */
  UsaepayGateway.prototype.addTransactionCreditData = function(args,data){
    args.Parameters.CreditCardData = {
      theAttrs: { 'xsi:type':"ns1:CreditCardData" },
      AvsStreet: data.billing.street,
      AvsZip: data.billing.zip,
      CardCode: data.card.verificationValue,
      CardNumber: data.card.number,
      CardExpiration: data.card.month+data.card.year
    };
  };

  /**
   * Adds ach information to the given SOAP args using the data provided
   * @param {Object} args pre formatted SOAP object with 
   *   params:
   *      AccountHolder, Details, RecurringBilling
   */
  UsaepayGateway.prototype.addTransactionACHData = function(args,data){
    var ach = data.ach;
    args.Parameters.Command = "Check:Sale";
    args.Parameters.CheckData = {
      CheckNumber: ach.check,
      Routing: ach.routing,
      Account: ach.account,
      AccountType: ach.accountType,
      DriversLicense: ach.driversLicense,
      DriversLicenseState: ach.driversLicenseState,
      recordType: ach.recordType,
      frontImage: ach.frontImage,
      backImage: ach.backImage
    };
  };

  /**
   * Adds credit card information to the given SOAP args using the data provided
   * @param {Object} args pre formatted SOAP object with 
   *   params:
   *     Details, BillingAddress, PaymentMethods
   */
  UsaepayGateway.prototype.addCustomerCreditData = function(args,data){
    args.CustomerData.PaymentMethods.item.push(
      {
        theAttrs: { 'xsi:type':"ns1:PaymentMethod" },
        AvsStreet: data.billing.street,
        AvsZip: data.billing.zip,
        CardCode: data.card.verificationValue,
        CardNumber: data.card.number,
        CardExpiration: data.card.month+data.card.year
      }
    );
  };

  /**
   * Adds ach information to the given SOAP args using the data provided
   * @param {Object} args pre formatted SOAP object with 
   *   params:
   *     Details, BillingAddress, PaymentMethods
   */
  UsaepayGateway.prototype.addCustomerACHData = function(args,data){
    args.CustomerData.PaymentMethods.item.push(
      {
        theAttrs: { 'xsi:type':"ns1:PaymentMethod" },
        CheckNumber: data.ach.check,
        Routing: data.ach.routing,
        Account: data.ach.account,
        AccountType: data.ach.accountType,
        DriversLicense: data.ach.driversLicense,
        DriversLicenseState: data.ach.driversLicenseState,
        recordType: data.ach.recordType,
        frontImage: data.ach.frontImage,
        backImage: data.ach.backImage
      }
    );
  };

  module.exports = UsaepayGateway;
})();
