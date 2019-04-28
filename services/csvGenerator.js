const async = require('async');
const csvtojson = require('csvtojson/v1');
const json2csv = require('json2csv');
const request = require('request');
const AWSBucketManager = require('./awsBucketManager');

function getGroupedCSVJSON(fileUrl, callback) {
    let firstHeader;
    let groupedCSVData = new Map();
    let remainedHeaderElements = [];

    // First we are checking if source file exists with the specified URL
    request(fileUrl, (err, response, body) => {
        if (err || !response || response.statusCode !== 200) {
            return callback(new Error(`Invalid CSV file url: ${fileUrl}!`));
        }
        // Start parsing CSV file: generate grouped CSV JSON data
        // by first header with remained header elements
        csvtojson()
            .fromString(body)
            .on('header', (header) => {
                remainedHeaderElements = header.slice(1);
                firstHeader = header[0];
            })
            .on('json', (jsonObj) => {
                const val = jsonObj[firstHeader];
                delete jsonObj[firstHeader];

                if (!groupedCSVData.has(val)) {
                    groupedCSVData.set(val, [jsonObj]);
                } else {
                    groupedCSVData.get(val).push(jsonObj);
                }
            })
            .on('done', (err) => {
                if (err) {
                    return callback(err);
                }
                return callback(null, groupedCSVData, remainedHeaderElements);
            });
    })
}

function storeSingleGroupedCSVFile(csvFilename, csvJson, header, callback) {
    const csv = json2csv.parse(csvJson, {fields: header});

    AWSBucketManager.uploadFile(csvFilename, csv, (err, result) => {
        if (err) {
            console.error('Failed to upload to S3, err: ', err);
            return callback(err);
        }
        console.log('Successfully uploaded to S3.');
        return callback(null, result);
    });
}

function validateParams(bodyParams) {
    if (!bodyParams || !bodyParams.csvUrl) {
        return {
            success: false,
            message: `Missing parameter 'csvUrl'!`
        }
    }
    return {
        success: true,
        message: 'OK',
        fileUrl: bodyParams.csvUrl
    }
}

function storeAllGroupedCSVFiles(groupedCSVData, headerElements, callback) {
    // Iterate over grouped CSV JSON data in parallel and store to S3 bucket
    // Return result with URLs to uploaded files when all the files are uploaded
    async.map(
        groupedCSVData.keys(),
        (key, next) => {
            const csvJson = groupedCSVData.get(key);
            storeSingleGroupedCSVFile(key, csvJson, headerElements, (err, result) => {
                if (err) {
                    return next(err);
                }
                next(null, result);
            })
        },
        (err, result) => {
            if (err) {
                return callback(err);
            }
            return callback(null, result);
        }
    )
}

module.exports.handleGenerateCSVRequest = (bodyParams, callback) => {
    // Validate if source CSV file url is passed properly
    const validationResult = validateParams(bodyParams);
    if (!validationResult.success) {
        return callback(new Error(validationResult.message));
    }
    const fileUrl = validationResult.fileUrl;

    // Generate CSV JSON data for first header grouped by header value
    getGroupedCSVJSON(fileUrl, (err, groupedCSVData, headerElements) => {
        if (err) {
            const errMsg = `Failed to parse input CSV file from URL: ${fileUrl}, err: ${err}!`;
            console.error(errMsg);
            return callback(new Error(errMsg));
        }
        console.log(`Successfully parsed input CSV file from URL: ${fileUrl}.`);

        if (headerElements.length === 0) {
            // Source CSV file contains less than 2 columns, no need to proceed.
            return callback(new Error(`Source CSV file contains less than 2 columns, stop processing!`));
        }
        storeAllGroupedCSVFiles(groupedCSVData, headerElements, (err, result) => {
            if (err) {
                const errMsg = `Failed to parse input CSV file from URL: ${fileUrl}, err: ${err}!`;
                console.error(errMsg);
                return callback(new Error(errMsg));
            }
            console.log(`Successfully generated grouped CSV files from URL: ${fileUrl}.`);
            return callback(null, result);
        });
    });
};
