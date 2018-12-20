# react-native-graphql-aws-amplify

## Get the backend running

### Install and configure Amplify CLI
`npm install -g @aws-amplify/cli`

`amplify configure`

### Clone this repo
`git clone git@github.com:mschaeffner/react-native-graphql-aws-amplify.git`

### Init Amplify in project
`amplify init`

### Configure Cognito user pool
`amplify add auth`

### Configure S3 Bucket for storage
`amplify add storage`

### Configure GraphQL API
`amplify add api`

When asked for a schema, use the file `schema.graphql` in root directory.

### Push all changes to AWS (this may take a few minutes)
`amplify push`


### Change GraphQL schema
- Login into AWS account
- Go to AppSync, select the new API and go to schema
- Replace the schema with following and save:

```
type ModelUserProfileConnection {
	items: [UserProfile]
	nextToken: String
}

type Mutation {
	updateUserProfile(input: UpdateUserProfileInput!): UserProfile
}

type Query {
	getUserProfile(id: ID!): UserProfile
	listUserProfiles(limit: Int, nextToken: String): ModelUserProfileConnection
}

type S3Object {
	bucket: String!
	region: String!
	key: String!
}

input S3ObjectInput {
	bucket: String!
	region: String!
	key: String!
}

type Subscription {
	onUpdateUserProfile: UserProfile
		@aws_subscribe(mutations: ["updateUserProfile"])
}

input UpdateUserProfileInput {
	id: ID!
	name: String
	location: String
	avatar: S3ObjectInput
}

type UserProfile {
	id: ID!
	name: String!
	location: String
	avatar: S3Object
}
```

### Replace the existing GraphQL resolvers with the followings

#### updateUserProfile(...): UserProfile
```
$util.qr($context.args.input.put("createdAt", $util.time.nowISO8601()))
$util.qr($context.args.input.put("updatedAt", $util.time.nowISO8601()))
$util.qr($context.args.input.put("__typename", "UserProfile"))
{
  "version": "2017-02-28",
  "operation": "PutItem",
  "key": {
      "id":     $util.dynamodb.toDynamoDBJson($ctx.args.input.id)
  },
  "attributeValues": $util.dynamodb.toMapValuesJson($context.args.input),
}
```


#### getUserProfile(...): UserProfile
```
{
  "version": "2017-02-28",
  "operation": "GetItem",
  "key": {
      "id": $util.dynamodb.toDynamoDBJson($ctx.args.id)
  }
}
```


#### listUserProfiles(...): ModelUserProfileConnection
```
#set( $limit = $util.defaultIfNull($context.args.limit, 10) )
{
  "version": "2017-02-28",
  "operation": "Scan",
  "filter": null,
  "limit": $limit,
  "nextToken":   #if( $context.args.nextToken )
"$context.args.nextToken"
  #else
null
  #end
}
```



## Get the app running

### Install NPM dependencies
yarn

### Run Expo application
yarn start
