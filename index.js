require('dotenv').config();
const app = require('./express');
const Cognito = require('./cognito');
const fs = require('fs');

console.log(`Cognito hosted auth: ${Cognito.getUrl()}`);

if(process.env.SSL_KEY && process.env.SSL_CERTIFICATE) {
    const sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY, 'utf8'),
        cert: fs.readFileSync(process.env.SSL_CERTIFICATE, 'utf8')
    };
    app.listen(sslOptions);
} else {
    app.listen();
}
