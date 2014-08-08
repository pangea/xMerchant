XMerchant
=============
A payment library for xCore

Usage
-------------
First, create an xmerchant object and pass it your preferred payment gateway. For paysimple:

    var XMerchant = require('./xmerchant'),
        PaysimpleGateway = require('./paysimple_gateway'),
        xmerchant = new XMerchant(),
        paysimple = new PaysimpleGateway();

        paysimple.UMkey = 'your_key_here';
        paysimple.pin = 'your_pin';

        xmerchant.setGateway(paysimple);

Next, use the pay function to create payments. 
Create a single credit card payment:
               
    var data = {
      type: 'credit',
      custId: 2,
      amount: "9.00",
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
    },
    paymentId;
    
    
    xmerchant.pay(data,function(result){
      paymentId = result.paymentId;
    });

To refund that payment: 

    xmerchant.refund(paymentId,'9',function(result){
      if (result){
        console.log("refund successful");
      }          
    });

To create a monthly recurring ach payment, 
           
    var data = {
      type: 'ach',
      custId: 2,
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
      ach: {
        routing: "987654301",
        check: "123",
        account: "5555555",
        accountType: "savings"
      }
    },
    planId;

    xmerchant.pay(data,function(result){
      planId = result.planId;
    });

To cancel this plan:
    
    xmerchant.cancelRecurringPayment(planId,function(success){
      if (success){
        console.log('Successfully cancelled the payment plan');
      }     
    });

To search for a payment created by the above plan

    xmerchant.searchPayments({custId: '2', amount: '9', start: '2014-8-8'},function(result){
      console.log("The paymentId is",result[0].paymentId);
    });

To search for a recurring payment plan, grab it's ID, and cancel it:

    xmerchant.searchPayments({custId: '2', amount: '9'}, function(result){
      xmerchant.cancelRecurringPayment(result[0].planId,function(success){
        if (success){
          console.log('Successfully cancelled the payment plan');
        }     
      });
    })

searchRecurringPayments(data,callback)
--------------------------
Passes an array of recurringPayment objects to the callback function
data can have all, some, but not none of these parameters:

Parameters  | Description
----------- | -----------
custId      | The ID of this customer. Assigned when the recurring payment was created
amount      | The amount to charge on each recurrence. Assigned when the recurring payment was created (no trailing zeros)
start       | The date this recurring payment was set up (YYYY-MM-DD)

recurringPayment objects consist of:

Key         | Description
----------- | -----------
planId      | Identifies the recurring payment plan's ID
amount      | The amount this plan charges every recurrence. 
billing     | A hash of billng info, includes firstName, lastName, street, street2, zip,city, state
schedule    | How often the recurring payment will happen
number      | The number of recurring payments left
start       | The date recurring payment was set up
next        | When the next payment will happen

searchPayments(data,callback)
------------------------------
Passes an array of payment objects to the callback function
can use all, some, but not none of these parameters:

Parameters  | Description
----------- | -----------
custId      | The ID of this customer. Assigned when the payment was created
amount      | The amount the customer was charged for this payment
start       | The date this payment was set up (YYYY-MM-DD)

Payment objects consist of: 

Key         | Description
----------- | -----------
custId      | Identifies this customer's ID.
amount      | The amount the customer was charged for this payment 
billing     | A hash of billng info, includes firstName, lastName, street, street2, zip,city, state
number      | The number of recurring payments left
date        | The date the payment was requested
status      | The status of the payment (P - Pending, E - Error)
result      | The result of the transaction (A - Approved, D - Declined)
paymentId   | The reference id of this payment, used for refunds
planId      | The recurring payment plan associated with this payment ('0' if no plan)
avs         | English interpretation of the avsCode
avsCode     | Address verification code, see http://wiki.usaepay.com/developer/avsresultcodes
cvv2        | English interpretation of cvv2Code
cvv2Code    | Card security code matching, see http://wiki.usaepay.com/developer/cvv2resultcodes
vpasCode    | Verified by Visa code. Undefined if any other card than Visa.
error       | English interpretation of the errorCode. 'Approved' if there was no error
errorCode   | Integer, 0 if there was no error.

pay(data,callback)
--------
Creates a payment or a recurring payment plan (depending on the data parameter)
Passes a paymentResponse object to the callback function

Parameters  | Description
----------- | -----------
type        | The type of payment, "ach" or "credit"
amount      | The amount the customer will be charged for this payment
custId      | The ID you will use to search for and identify this customer
billing     | A billing object 
recurrence  | A recurrence object (omit for a single non-recurring payment)
card        | A credit card object
ach         | An ach object

Billing objects:

Attributes  | Description
----------- | -----------
fullName    | Full name as it appears on a Credit Card/ billing address
street      | Street Address, line 1
street2     | Street Address, line 2 (optional)
city        | City (optional)
state       | State (optional) 
zip         | Zip
email       | Email address (to send receipt to) (optional)

Recurrence objects: 

Attributes  | Description
----------- | -----------
schedule    | How often to schedule a payment. ("daily","weekly","biweekly","monthly","bimonthly","quarterly","biannually", or "anually". Note these may not all be supported by your payment gateway. Consult gateway specific documentation)
start       | When the first payment should occur (YYYY-MM-DD) ("next" for the next day)
number      | The number of times to repeat this payment


Credit card objecs:

Attributes  | Description
----------- | -----------
number      | Credit card number
month       | Expiration month
year        | Expiration year
verificationValue | CVV verification code on the back of the card
type        | type of card (E.G visa, mastercard, discovery)

ACH objects:

Attributes  | Description
----------- | -----------
routing     | Routing number on the check
check       | Check number
account     | Account number
accountType | Account type (checkings, savings)
driversLicence | Drivers licence number (optional)
driversLicenseState | Drivers license state (optional unless driversLicence specified)
recordType  | Record type of electronic check transaction, not supported by all check processors (optional)
frontImage  | Image of the front of the check (optional)
backImage   | Image of the back of the check (optional)

Payment response objects:

Attributes  | Description
----------- | -----------
status      | The status of the payment (P - Pending, E - Error)
result      | The result of the transaction (A - Approved, D - Declined)
paymentId   | The reference id of this payment, used for refunds
planId      | The recurring payment plan associated with this payment ('0' if no plan)
avs         | English interpretation of the avsCode
avsCode     | Address verification code, see http://wiki.usaepay.com/developer/avsresultcodes
cvv2        | English interpretation of cvv2Code
cvv2Code    | Card security code matching, see http://wiki.usaepay.com/developer/cvv2resultcodes
vpasCode    | Verified by Visa code. Undefined if any other card than Visa.
error       | English interpretation of the errorCode. 'Approved' if there was no error
errorCode   | Integer, 0 if there was no error.

refund(paymentId,amount,callback)
---------------------------------
Refunds the payment specified by the payment ID and amount(to refund, not to exceed original purchase amount)

cancelRecurringPayment(planId,callback)
--------------------------------------
Cancels the recurring payment specified by the planId
