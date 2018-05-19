const app = require('./express');
const config = require('./config');
const fs = require('fs');

console.log(`Cognito hosted auth: ${config.hostedAuthPage()}`);

if(config.sslKey() && config.sslCertificate()) {
    const sslOptions = {
        key: fs.readFileSync(config.sslKey(), 'utf8'),
        cert: fs.readFileSync(config.sslCertificate(), 'utf8')
    };
    app.listen(sslOptions);
} else {
    app.listen();
}
