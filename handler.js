'use strict';

module.exports.generateCSV = async (event) => {
    const reqBody = JSON.parse(event.body);
    const csvUrl = reqBody.csvUrl;
    if (!csvUrl) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `Missing parameter 'csvUrl'!`,
            })
        };
    }
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Successfully executed POST api!',
            input: event.body,
        })
    };
};
