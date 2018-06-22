const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');

const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE
const dynamoDb = new AWS.DynamoDB.DocumentClient();

app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/applications/:applicationId', function (req, res) {
  const applicationId = req.params.applicationId
  const params = {
    TableName: APPLICATIONS_TABLE,
    Key: {
      applicationId: applicationId
    },
  }

  dynamoDb.get(params, (error, result) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not get application' });
    }
    if (result.Item) {
      const {applicationId} = result.Item;
      res.json({ applicationId });
    } else {
      res.status(404).json({ error: "Application not found" });
    }
  });
})

app.post('/applications/', function (req, res) {
  const applicationId = req.body.applicationId;
  const renterId = req.body.renterId;
  const spaceId = req.body.spaceId;
  const dateRange = req.body.dateRange;

  if (typeof applicationId !== 'string') {
    return res.status(400).json({ error: 'applicationId must be a string' });
  }

  const params = {
    TableName: APPLICATIONS_TABLE,
    Item: {
      applicationId: applicationId,
      renterId: renterId,
      spaceId: spaceId,
      dateRange: dateRange,
      state: 'pending'
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      return res.status(400).json({ error: 'Could not create application' });
    }
    res.json({ applicationId });
  });
})


module.exports.handler = serverless(app);
