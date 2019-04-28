const AWS = require('aws-sdk');
const config = require('./config/config');

class AWSBucketManager {
    constructor() {
        // Create S# instance with the specified credentials
        this.s3 = new AWS.S3({
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey
        });
    }

    uploadFile(filename, fileContent, callback) {
        const params = {
            Bucket: config.bucketName,
            Key: `CSV/${filename}.csv`, // file will be saved as CSV/<filename>.csv
            Body: fileContent
        };
        // 'upload' function is preferred for big files instead of 'putObject'
        // Also it returns uploaded file URLs.
        this.s3.upload(params, (err, result) => {
            if (err) {
                return callback(err);
            }
            return callback(null, result);
        });
    }
}

module.exports = new AWSBucketManager(); // Singleton instance



