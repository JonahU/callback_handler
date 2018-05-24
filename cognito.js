const Promise = require('bluebird');
const config = require('./config');
const rp = require('request-promise');
const jwkToPem = require('jwk-to-pem');
const { first } = require('lodash');
const verify = Promise.promisify(require('jsonwebtoken').verify);

const jwksPath = `https://cognito-idp.${config.awsRegion()}.amazonaws.com/${config.poolId()}/.well-known/jwks.json`;

const oauth2 = require('simple-oauth2').create({
    client: {
        id: config.clientId(),
        secret: config.clientSecret()
    },
    auth: {
        tokenHost: `https://${config.cognitoDomainPrefix()}.auth.${config.awsRegion()}.amazoncognito.com`,
        tokenPath: '/oauth2/token',
        authorizePath: `login?redirect_uri=${config.redirectUri()}&response_type=code&client_id=${config.clientId()}`
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
        redirect_uri: config.redirectUri()
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
            const idPem = jwkToPem(jwks.keys[0]);
            return verify(token.token.id_token, idPem);
        })
        .then(decodedToken => {
            const tokenObj = {
                decodedToken,
                token: token.token
            }
            resolve(tokenObj)
        })
        .catch(err => reject(new Error('Token verification failed')));
});

const getGroup = token => new Promise((resolve, reject) => {
    const accessToken = token.decodedToken;
    const group = first(accessToken['cognito:groups']);
    const overrideRedirect = accessToken.override_redirect_uri;
    resolve([group, token, overrideRedirect]);
});

module.exports = { getAuthCode, fetchToken, verifyToken, getGroup }
