require('dotenv').config();
const app = require('./express');

console.log(`Cognito hosted auth: https://${process.env.COGNITO_DOMAIN_PREFIX}.auth.${process.env.AWS_REGION}.amazoncognito.com/login?response_type=code&client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}`);
app.listen;