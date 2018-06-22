const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express')
const app = express()
const AWS = require('aws-sdk');

const APPLICATIONS_TABLE = process.env.APPLICATIONS_TABLE

app.use(bodyParser.json({ strict: false }));

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/applications/:applicationId', function (req, res) {
  const dynamoDb = new AWS.DynamoDB.DocumentClient();
  const applicationId = parseInt(req.params.applicationId)
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

app.post('/applications', function (req, res) {
  const { applicationId } = req.body;
  if (typeof applicationId !== 'number') {
    res.status(400).json({ error: 'applicationId must be an integer' });
  }

  const params = {
    TableName: APPLICATIONS_TABLE,
    Item: {
      applicationId: applicationId
    },
  };

  dynamoDb.put(params, (error) => {
    if (error) {
      console.log(error);
      res.status(400).json({ error: 'Could not create application' });
    }
    res.json({ applicationId });
  });
})


module.exports.handler = serverless(app);
