const Promise = require('bluebird');
const rp = require('request-promise');
const jwkToPem = require('jwk-to-pem');
const { first } = require('lodash');
const verify = Promise.promisify(require('jsonwebtoken').verify);

const config = {
    id: process.env.CLIENT_ID,
    secret: process.env.CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI,
    userPoolId: process.env.POOL_ID,
    region: process.env.AWS_REGION,
    prefix: process.env.COGNITO_DOMAIN_PREFIX
};

const jwksPath = `https://cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}/.well-known/jwks.json`;

const oauth2 = require('simple-oauth2').create({
    client: {
        id: config.id,
        secret: config.secret
    },
    auth: {
        tokenHost: `https://${config.prefix}.auth.${config.region}.amazoncognito.com`,
        tokenPath: '/oauth2/token',
        authorizePath: `login?redirect_uri=${config.redirectUri}&response_type=code&client_id=${config.id}`
    }
});

const getAuthCode = query => new Promise((resolve, reject) => {
    const code = query.code;
    if (!code) reject(new Error('Invalid query params'));
    resolve(code);
})

const fetchToken = code => new Promise((resolve, reject) => {
    const tokenConfig = {
        code,
        redirect_uri: config.redirectUri
    };

    oauth2.authorizationCode.getToken(tokenConfig)
    .then((result) => {
      const accessToken = oauth2.accessToken.create(result);
      resolve(accessToken);
    })
    .catch(error => reject(new Error('Error fetching token ', error)));
});

const verifyToken = token => new Promise((resolve, reject) => {
    rp(jwksPath)
        .then((jwksString) => {
            const jwks = JSON.parse(jwksString);
            const accessPem = jwkToPem(jwks.keys[1]);
            return verify(token.token.access_token, accessPem);
        })
        .then(accessToken => resolve(accessToken))
        .catch(err => reject(new Error('Token verification failed')));
});

const getGroup = accessToken => new Promise((resolve, reject) => {
    const group = first(accessToken['cognito:groups']);
    resolve(group);
});

const getUrl = () => {
    return `https://${config.prefix}.auth.${config.region}.amazoncognito.com/login?response_type=code&client_id=${config.id}&redirect_uri=${config.redirectUri}`;
}

module.exports = { getAuthCode, fetchToken, verifyToken, getGroup, getUrl }
