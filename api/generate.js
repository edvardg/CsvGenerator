'use strict';

const CSVGenerator = require('../services/csvGenerator');
const util = require('util');

const handleGenerateCSVRequest = util.promisify(CSVGenerator.handleGenerateCSVRequest);

module.exports.generateCSV = async (event) => {
    const bodyParams = JSON.parse(event.body);
    try {
        const result = await handleGenerateCSVRequest(bodyParams);
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Successfully generated grouped CSV files from source URL.',
                result: result,
            }),
        };
    } catch (err) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Failed to generated grouped CSV files from source URL!',
                error: err.toString()
            })
        };
    }
};
