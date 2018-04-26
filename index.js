require('dotenv').config();
const app = require('./express');
const fs = require('fs');

console.log(`Cognito hosted auth: https://${process.env.COGNITO_DOMAIN_PREFIX}.auth.${process.env.AWS_REGION}.amazoncognito.com/login?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}`);

if(process.env.SSL_KEY && process.env.SSL_CERTIFICATE) {
    const sslOptions = {
        key: fs.readFileSync(process.env.SSL_KEY, 'utf8'),
        cert: fs.readFileSync(process.env.SSL_CERTIFICATE, 'utf8')
    };
    app.listen(sslOptions);
} else {
    app.listen();
}
