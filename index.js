const dotenv = require('dotenv');
dotenv.config();

const { Provider } = require('oidc-provider');

const configuration = {
  // ... see the available options in Configuration options section
  formats: {
    AccessToken: 'jwt',
  },
  clients: [{
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
    redirect_uris: [process.env.CLIENT_URI],
    scope: 'openid',
    grant_types: ['authorization_code'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
    jwks: {
      //jwks representation of client's public key to use for encryption
      keys: [
        {
          kty: '<to be provided by implementer>',
          e: '<to be provided by implementer>',
          kid: '<to be provided by implementer>',
          n: '<to be provided by implementer>',
          use: 'enc',
          alg: '<to be provided by implementer>',
        }
      ]
    },
    id_token_encrypted_response_alg: 'RSA-OAEP-256',
    id_token_encrypted_response_enc: 'A256CBC-HS512',
    // + other client properties
  }],
  findAccount: async function findAccount(ctx, sub, token) {
    return {
      accountId: sub,
      async claims(use, scope, claims, rejected){
        return {
          sub: sub, // it is essential to always return a sub claim
          userInfo: {
            CPAccType: 'User',
            CPUID_FullName: 'John Doe Coach',
            ISSPHOLDER: 'YES',
          },
          amr: ['pwd','sms'],
        };
      }
    };
  },
  features: {
    introspection: { enabled: true },
    encryption: { enabled: true },
    userinfo: { enabled: false },
    jwtUserinfo: { enabled: false },
  },
  jwks: {
    //jwks representation of private key to use for signing Tokens
    keys: [
      {
        e: '<to be provided by implementer>',
        n: '<to be provided by implementer>',
        d: '<to be provided by implementer>',
        p: '<to be provided by implementer>',
        q: '<to be provided by implementer>',
        dp: '<to be provided by implementer>',
        dq: '<to be provided by implementer>',
        qi: '<to be provided by implementer>',
        kty: '<to be provided by implementer>',
        kid: '<to be provided by implementer>',
        use: 'sig'
      },
    ]
  },
  claims: {
    openid: ['sub','amr','userInfo'],
  },
  extraAccessTokenClaims: async function extraAccessTokenClaims(ctx, token) {
    return {
      authorization : {
        EntityInfo : {},
        AccessInfo : {},
        TPAccessInfo : {},
      },
    };
  },
  issueRefreshToken : async function issueRefreshToken(ctx, client, code) {
    //return client.grantTypeAllowed('refresh_token') && code.scopes.has('offline_access');
    return true;
  },
  whitelistedJWA: {
    idTokenEncryptionAlgValues: [
      'A128KW',
      'A256KW',
      'ECDH-ES',
      'ECDH-ES+A128KW',
      'ECDH-ES+A256KW',
      'RSA-OAEP',
      'RSA-OAEP-256'
    ],
    idTokenEncryptionEncValues: [
      'A128CBC-HS256',
      'A128GCM',
      'A256CBC-HS512',
      'A256GCM'
    ]
  },
  ttl: {
    AccessToken: 1 * 60 * 60, // 1 hour in seconds
    AuthorizationCode: 10 * 60, // 10 minutes in seconds
    IdToken: 1 * 60 * 60, // 1 hour in seconds
    DeviceCode: 10 * 60, // 10 minutes in seconds
    RefreshToken: 1 * 24 * 60 * 60, // 1 day in seconds
  },
};

const host = process.env.NODE_HOST;
const port = process.env.NODE_PORT;
console.log(`Hostname: ${host}`);
console.log(`Port Number: ${port}`);

const oidc = new Provider(`http://${host}:${port}`, configuration);

// oidc.proxy = true;

// express/nodejs style application callback (req, res, next) for use with express apps, see /examples/express.js
// oidc.callback

// koa application for use with koa apps, see /examples/koa.js
// oidc.app

// or just expose a server standalone, see /examples/standalone.js
const server = oidc.listen(3000, () => {
  console.log(`oidc-provider listening on port 3000, check http://${host}:${port}/.well-known/openid-configuration`);
});