const env = require('dotenv').config().parsed;
const { kebabCase } = require('lodash');

module.exports = {
  awsRegion: () => env.AWS_REGION,
  clientId: () => env.CLIENT_ID,
  clientSecret: () => env.CLIENT_SECRET,
  cognitoDomainPrefix: () => env.COGNITO_DOMAIN_PREFIX,
  groupA: () => env.GROUP_A,
  groupB: () => env.GROUP_B,
  redirectA: () => env.REDIRECT_A,
  redirectB: () => env.REDIRECT_B,
  hostedAuthPage: () => `https://${env.COGNITO_DOMAIN_PREFIX}.auth.${env.AWS_REGION}.amazoncognito.com/login?response_type=code&client_id=${env.CLIENT_ID}&redirect_uri=${env.REDIRECT_URI}`,
  pathA: () => kebabCase(env.GROUP_A),
  pathB: () => kebabCase(env.GROUP_B),
  pathForGroup: (group) => kebabCase(group),
  poolId: () => env.POOL_ID,
  port: () => env.PORT,
  redirectUri: () => env.REDIRECT_URI,
  sslKey: () => env.SSL_KEY,
  sslCertificate: () => env.SSL_CERTIFICATE,
  tokenNameOverrideA: () => env.TOKEN_NAME_OVERRIDE_A,
  tokenNameOverrideB: () => env.TOKEN_NAME_OVERRIDE_B
}