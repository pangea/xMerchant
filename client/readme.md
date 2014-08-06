Customers:
        :custId
        

For payments: 
   data:
   type
   fullName
   custId (used for recurring billing so you can identify the customer)
   amount
   recurrence: (none, daily, weekly, biweekly, monthly, bimonthly, quarterly, biannually, anually)
   start
   number
  
   card: 
     number
     month
     year
     verificationValue
     type
     street
     city
     state
     zip
   OR

   Check data:
     routing
     account
     accountType

   passed to callback credit:
   status
   authCode
   avsCode
   cvv2Code
   vpasCode
   result
   error
   errorCode
   refNum (useful for refunds)


   passed to callback check:
   status
   authCode
   result
   error
   errorCode
   refNum (useful for refunds)


refunds:
   refNum 
