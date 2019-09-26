const habit = require('./example_habit');
const AWS = require('aws-sdk');

AWS.config.update({
    region: "us-west-2",
    endpoint: "http://localhost:8000"
});
  
var dynamodb = new AWS.DynamoDB.DocumentClient();

var params = {
    Item: habit, 
    TableName: "habit-records"
   };
   dynamodb.put(params, function(err, data) {
     if (err) console.log(err, err.stack); // an error occurred
     else     console.log(data);           // successful response
   });
console.log(params)
