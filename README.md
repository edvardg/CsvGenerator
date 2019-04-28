# CsvGenerator
## About The Project
The project provides functionality to generate multiple CSV files from the source CSV file URL. It expects an input CSV file URL containing an arbitrary set of data and outputs the same data in multiple CSV files, where values got grouped by the value of the first column. Each file is named after the value of the first column. Output CSV files do not contain the value of the first column inside.

## How To Use
In order to use the project functionality you need to:
1. Have AWS user.
2. Serverless CLI installed on your machine and configured with user credentials.
3. Update project configuration with your user credentials (see below for more details).
4. Deploy to AWS and get API GateWay URL.

You need to update serverless.yml and services/config/config.js files as follows:
1. serverless.yml - Update 'profile' and 'region' sections with your details.
2. config.js - Update all sections with your AWS user/bucket details.

You will get an API once you've deployed the project to AWS. The API represents API GateWay which can be used to interact with AWS lambda function. You need to make POST request with body containing 'csvUrl' key - the source CSV file URL.

Here is an example of request body:
{"csvUrl":"https://filebin.net/kr3jqf5a8wnrx0yd/test.csv?t=9fyad0i9"}

The response of API call should contain either - message about success and result with new generated CSV file URLs, or - message about failure and error details.

## Possible improvements
The project may be improved in the following ways:
1. Add input file size validation - based on project requirements.
2. Add tests - based on project requirements.
3. Use async/await style instead of callbacks in services and get rid of uril.promisify() function - I've started with callback style before noticed async/await in handler of lambda function. 
