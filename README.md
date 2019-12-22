# Arc-Hive-SL
A read only Hive archive hosted in AWS using lambda, API Gateway, and Cloudfront.

## About

## Release Notes

## Topology

### Working Order

- Secrets
- S3 Permissions
- Azure AD Auth
- Mongo Atlas
- Logging

- S3 react frontend (I can test locally first)

### Permissions Structure

- The function execution roles (arc-hive-api-{{env}}-us-west-2-lambdaRole) have been granted read permissions on the S3 bucket containing Hive binary data (krey-arc-hive).

- Mongo Atlas ACL


### Logging Structure


### Deployment Procedure

#### apiServer

```shell
sls deploy --env production
```

#### client

```
npm run-script build
# Move that to S3 bucket
```

### Reference Information

https://github.com/colynb/serverless-dotenv-plugin



