(function(){
  var XMerchant = require('./xmerchant'),
      PaysimpleGateway = require('./paysimple_gateway'),
      xmerch = new XMerchant(),
      paysimple = new PaysimpleGateway();

  paysimple.UMkey = 'f2U9x3xqNqn7VnCE3X3H1BebG4cp4M22';
  paysimple.pin = '1234';
  xmerch.setGateway(paysimple);

  var data = {
    type: 'credit',
    custId: 3,
    amount: "9.00",
    recurrence: {
      schedule: "daily",
      start: "next", // YYYYMMDD
      number: "5"
    },    
    billing: {
      fullName: 'Noah Joseph Prince', 
      zip: "90036",
      street: "5900 Wilshire Blvd",
      email: "nprince@pangeaeqity.com"
    },
    card: {
      number: '4000100011112224',
      month: '09',
      year: '14', 
      verificationValue: '123',
      type: 'visa'
    }
  };

  // var data = {
  //   paymentId: 60251092
  // };

  // // declined card
  // var data = {
  //   fullName: 'Noah Prince', 
  //   number: '4000300011112220',
  //   month: '09',
  //   year: '14', 
  //   verificationValue: '999',
  //   cardType: 'visa',
  //   amount: "9",
  //   type: 'credit',
  //   response: 'y',
  //   zip: "90036",
  //   street: "5900 Wilshire Blvd"
  // };

  // var data = {
  //   type: "ach",
  //   fullName: 'Joseph Prince', 
  //   custId: 2,
  //   amount: "9.00",
  //   refNum: '60240760',
  //   // recurrence: "monthly",
  //   // start: "next", // YYYYMMDD
  //   // number: "5",
  //   ach: {
  //     routing: "987654301",
  //     amount: "10",
  //     account: "5555555"
  //   }
  // };

  // var data = {
  //   type: "credit",
  //   fullName: 'Noah Prince', 
  //   refNum: "60240712"
  // };

  // pangea card
  //   var data = {
  //   fullName: 'Noah Prince', 
  //   number: '376740807282501',
  //   month: '10',
  //   year: '17', 
  //   verificationValue: '4181',
  //   cardType: 'American Express',
  //   amount: "0.01",
  //   type: 'credit',
  //   response: 'y',
  //   zip: "60654",
  //   street: "640 n LaSalle ste 638"
  // };

  // xmerch.pay(data,function(response){
  //   console.log(response);
  // });

  xmerch.searchPayments({ custId: 3, amount: '9'},function(response){
    // xmerch.cancelRecurringPayment(response[0].planId,function(result){
    //   console.log(result);
    // });

    console.log(response);

  });
})();
