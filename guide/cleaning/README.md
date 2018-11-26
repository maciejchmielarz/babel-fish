# Build a Babel Fish with Machine Learning Language Services

This repository contains necessary resources for AWS re:Invent 2018 workshop AIM313. In this readme you will find detailed instructions how to cleanup your environment.

<img src="../../img/flow4.png" />

## Cleaning

When the workshop is finished you may consider taking following housekeeping steps at your AWS account.

The S3 bucket was created as public and is accessible to anyone on the Internet. You may want to change this setting and restrict access (in current setup the app will stop working though).

It's also very easy to remove all AWS resources created for this workshop. Firstly, you need to use S3 service in the AWS Console to empty your S3 bucket. Secondly, you need to use CloudFormation service in AWS Console to delete created resources. To do this select checkbox next to created `babel-fish-app` stack and choose `Delete Stack` option in `Actions` menu.

<a href="../phase3"><img src="../../img/button-previous.png" width="200"></a>
