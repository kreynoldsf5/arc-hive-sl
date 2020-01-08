# Arc-Hive-SL
A read only archive of content previously hosted in a Jive instance -- `Hive`.

## About
This is a GSA/Field Enablement project allowing access to legacy content from `Hive`. 
Use the arcHive to migrate content from supported systems (ie. sharepoint).

The arcHive currently holds all published documents and blog posts from Hive.
Binary content (PDFs, PowerPoints, zip archives, tarballs, etc.) from these assets can be downloaded.
Other space content (ie. index/content pages for groups and communities) will be added in the coming days.
Hive’s main social and gamification features (polls, kudos, etc.) will not be replicated.

Authentication to the arcHive is handled through federation with Active Directory.
Simply log in as you would to any federated service (including Duo MFA).
Rudimentary search capabilities are provided including some advanced options.
You may notice some inconsistencies with how html content is rendered due to how Hive stored this data.
If display issues are preventing you from retrieving content please open an issue (although aesthetic issues will be de-prioritized).

Use this repository's ['issues'](/issues) to report problems. 

## Release Notes

### 1/8/20
First General Availability release. 

### 1/6/20
React SPA now hosted from S3 and accessed through CloudFront. 

### 12/22/19
Ported api server to the [serverless framework](https://serverless.com/) and AWS Lambda fronted by AWS API Gateway.
The app can now scaled based on demand as opposed to writing scaling and deployment logic at the EC2 instance level.

### 11/14/19
Initial POC released to a pilot group. API server running in Express and static React Single Page App (ie. client) hosted by NGINX in an EC2 instance.
All content data is hosted in [Mongo Atlas](https://cloud.mongodb.com/).
Binary data hosted in a private S3 bucket (accessed by the instances IAM role).

## Reference
### [Topology](/topology.md)
### [Deployment](/deployment.md)




