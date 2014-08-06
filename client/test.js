(function(){
  var XMerchant = require('./xMerchant'),
      PaysimpleGateway = require('./paysimple_gateway.js'),
      xmerch = new XMerchant(),
      paysimple = new PaysimpleGateway();

  paysimple.UMkey = 'f2U9x3xqNqn7VnCE3X3H1BebG4cp4M22';
  paysimple.pin = '1234';
  xmerch.setGateway(paysimple);

  var data = {
    type: 'credit',
    fullName: 'Noah Prince', 
    custId: 1,
    amount: "9.00",
    refNum: '60240760',
    recurrence: "none",
    start: "next", // YYYYMMDD
    numLeft: "5",
    card: {
      number: '4000100011112224',
      month: '09',
      year: '14', 
      verificationValue: '123',
      type: 'visa',
      zip: "90036",
      street: "5900 Wilshire Blvd"
    }
  };

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
  //   fullName: 'Noah Prince', 
  //   routing: "987654321",
  //   amount: "10",
  //   account: "5555555"
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

  xmerch.pay(data,function(response){
    console.log(response);
  });

  // xmerch.getRecurringPayments(1,function(response){
  //   console.log(response);
  // });
})();
