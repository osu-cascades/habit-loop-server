# CBT Habit Loop Server

A GrahpQL server that will handle routing and database persistence.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You'll need to have Node.js (version 8 or newer) installed on your computer:
https://nodejs.org/en/

Install modules

```
npm install
```

You will also need to install serverless or run serverless in the node_modules bin.
I suggest installing serverless globally with:

```
npm install -g serverless
```

If running with a local dynamodb you can use docker to start up an instance:

```
docker run -p 8000:8000 amazon/dynamodb-local
```

Otherwise running dynamodb will require Java.

#### A Quick Note About GitHub Actions and Secrets

This service uses Github Actions, a CI/CD pipeline that will automatically build and test your commits if a pull request has been created. The Repo owner will be able to provide secrets for Redis, along with `demo account email` and `demo account password` upon request. These are stored in GitHub as secrets for GitHub Actions to use when building and testing, however, it is your responsibility to maintain a `.env` file for testing locally. We use the `serverless dotenv plugin` to access these keys through `process.env`

#### Envrionment Variables:
* REDIS_HOST - Hostname for Redis service
* REDIS_PASSWORD - Password for Redis service
* DEMO_EMAIL - Demo email address used for Apple's review of Habit Tracker
* DEMO_PASSWORD - Demo password used for Apple's review of Habit Tracker
* AWS credentials are set up through the AWS cli on dev's machine.

#### GraphQL Endpoint
* https://8n4s5ygsif.execute-api.us-east-1.amazonaws.com/qa/graphql

#### Redis

This service also uses Redis, and the `host` and `password` keys can be provided upon request.

**If you wish to set up Redis using keys of your own**: Redis Labs is a good, free way to get a Redis instance up and running. Just sign up [here](https://redislabs.com/) and they'll walk you through the process pretty easily. What you'll need is the host and password. Those can be set in the environment whenever it should be deployed or started locally.

#### AWS Credentials

To deploy the server in AWS and receive a url that anyone can access, you'll need aws credentials from IAM.

Create an AWS account if you do not have one and go to the IAM dashboard. From there go to the access keys tab and hit `Create New Access Key`.

Save the file containing the keys if you want and then configure them with [serverless](https://serverless.com/framework/docs/providers/aws/cli-reference/config-credentials/)

More explicit documentation on configuring secrets with AWS described in the [serverless docs](https://serverless.com/framework/docs/providers/aws/guide/credentials/).

Remember to NEVER COMMIT THEM TO THE REPO.

## Deploying

To deploy to your AWS account all you have to do is run:

```
NODE_ENV=qa serverless deploy
```

Make sure the AWS credentials are set up properly if you get errors.

## Running Locally

Once you clone this git repository, navigate to the containing folder and run

```
NODE_ENV=dev serverless offline start
```

You can then visit the graphql playground at localhost:3000/playground

## Testing

To test the server run the following command:

```
npm test
```

The http file in `src/test` uses the rest client in vscode available [here](https://marketplace.visualstudio.com/items?itemName=humao.rest-client).

The extension now supports graphQL queries so it's really easy to test if the lambda is running in AWS and to get some quick debugging done.

## Debugging

Sometimes the logs are responses are not very clear when hitting the endpoints from the app or manually. You can pass a graphQL query directly into the lambda through AWS.

This service also makes use of **Reactotron** for debugging. To use Reactotron, just install it [here](https://infinite.red/reactotron) and have it running it before you start Expo on the front-end. This allows you to view GraphQL queries and mutations being sent and received.

## Built With

- [Express](https://expressjs.com/) - The web framework used
- [GraphQL](https://graphql.org/) - Query Engine
- [Apollo](https://github.com/apollographql/apollo-server/tree/master/packages/apollo-server-express) - Integrates Express and GraphQL
- [DynamoDB](https://aws.amazon.com/dynamodb/) - NoSQL Database
- [Serverless](https://serverless.com) - Framework for deploying a serverless service as an AWS Lambda

## Authors

- **DJ Shamblin** - _Team member_
- **Nathan Hildebrandt** - _Team member_

See also the list of [contributors](https://github.com/osu-cascades/habit-loop/graphs/contributors) who participated in this project.

## Acknowledgments

- CBT Nuggets - Thanks for the great project
- Yong Bakos - Our awesome OSU CS teacher
