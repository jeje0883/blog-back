const serverless = require('serverless-http');
const app = require('../index'); // Adjust the path if necessary

module.exports.handler = async (event, context) => {
    try {
        return await serverless(app)(event, context);
    } catch (error) {
        console.error('Error during function invocation:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Internal Server Error' }),
        };
    }
};
