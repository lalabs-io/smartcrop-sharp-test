/**
 * AWS Lambda function logging in Node.js
 * https://docs.aws.amazon.com/lambda/latest/dg/nodejs-logging.html
 */

function format(message, object = null) {
  return object ? `${message}\n${JSON.stringify(object, null, 2)}` : message;
}

const Logger = {
  log: (message, object) => console.log(format(message, object)),
  warn: (message, object) => console.warn(format(message, object)),
};

module.exports = Logger;
