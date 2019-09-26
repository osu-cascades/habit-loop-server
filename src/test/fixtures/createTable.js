var AWS = require("aws-sdk");
const YAML = require('yamljs')
const _ = require('lodash');

AWS.config.update({
    region: "us-east-1",
    endpoint: "http://localhost:8000"
});

var dynamodb = new AWS.DynamoDB();

const {
    Resources: resources = null
} = YAML.load('./habit_table_structure.yaml');

_(resources)
    .pickBy(resource => {
        const {
            Type: type
        } = resource;

        return type === 'AWS::DynamoDB::Table';
    })
    .reduce(async (previousPromise, resource) => {
        const {
            Properties: properties
        } = resource;

        const collection = await previousPromise;

        try {
            table = await dynamodb.createTable(properties).promise();
            console.log(table);
            collection.created.push(table);
        } catch (err) {
            console.log(err);

            collection.failed.push(err);
        }

        return collection
    }, Promise.resolve({
        created: [],
        failed: []
    }))