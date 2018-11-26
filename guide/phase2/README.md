# Build a Babel Fish with Machine Learning Language Services

This repository contains necessary resources for AWS re:Invent 2018 workshop AIM313. In this readme you will find detailed instructions for `Phase 2`.

<img src="../../img/flow2.png" />

## Phase 2: Translate text

Use Lambda service in the AWS Console to open `TranslateLambda` function. In the `Add triggers` section on the left configure trigger for this function:

1. Choose S3 as the trigger and go to the `Configure triggers` section.
1. Pick correct S3 bucket name.
1. Pick `PUT` as event type.
1. Put `.json` as suffix.
1. Click `Add` at the bottom of the page to add trigger.
1. Click `Save` at the top of the page to confirm changes to the function.

Implement the function to use transcription result and translate it with Amazon Translate.

> Hint: Your function should put translation result to a `.txt` file in project's S3 bucket and use the same file naming convention as Babel Fish JavaScript component.

> Hint: You may want to look up [Amazon Translate Boto 3 Docs](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/translate.html) or inspire yourself with [Amazon Translate Getting Started](https://docs.aws.amazon.com/translate/latest/dg/examples-python.html).

> Hint: Getting behind? No worries, we've got you covered! When the time is up speakers will provide the password to the `solution.zip` file with a ready solution and will show how to apply it to unblock next steps.

## Testing

To test this part of implementation, open your Babel Fish web app, record yourself or upload an audio file (you can use example files from the setup phase) and verify in the S3 bucket if a `txt` file with translation result is created.

> Hint: If it didn't work you may start troubleshooting by:
> 1. checking if transcription result in `json` file contains `transcript` that is non-empty and makes sense,
> 1. checking Lambda function logs in CloudWatch for errors (to do that navigate to `Monitoring` tab in the AWS Console, see relevant documentation [here](https://docs.aws.amazon.com/lambda/latest/dg/monitoring-functions-logs.html)).

**Once you're finished with this phase please wait for speakers to present the next one before moving forward.**

<a href="../phase1"><img src="../../img/button-previous.png" width="200"></a>
<a href="../phase3"><img src="../../img/button-next.png" width="200"></a>
