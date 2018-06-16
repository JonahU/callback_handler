const env = require('dotenv').config().parsed;
const { kebabCase, snakeCase, toUpper } = require('lodash');

const envName = (prefix, identifier) => toUpper(snakeCase(`${prefix}_${identifier}`));

module.exports = {
  awsRegion: () => env.AWS_REGION,
  clientId: () => env.CLIENT_ID,
  clientSecret: () => env.CLIENT_SECRET,
  cognitoDomainPrefix: () => env.COGNITO_DOMAIN_PREFIX,
  group: (identifier) => env[envName('group', identifier)],
  redirect: (identifier) => env[envName('redirect', identifier)],
  hostedAuthPage: () => `https://${env.COGNITO_DOMAIN_PREFIX}.auth.${env.AWS_REGION}.amazoncognito.com/login?response_type=code&client_id=${env.CLIENT_ID}&redirect_uri=${env.REDIRECT_URI}`,
  path: (identifier) => kebabCase(env[envName('group', identifier)]),
  pathForGroup: (group) => kebabCase(group),
  poolId: () => env.POOL_ID,
  port: () => env.PORT,
  redirectUri: () => env.REDIRECT_URI,
  sslKey: () => env.SSL_KEY,
  sslCertificate: () => env.SSL_CERTIFICATE,
  tokenNameOverride: (identifier) => env[envName('tokenNameOverride', identifier)],
}