const { PayloadSigner } = require('./index');
const crypto = require('crypto');

const body = JSON.stringify({
  limit: 25,
  sort: "tradeTime",
  sortOrder: "desc"
});

// Compute Digest header
const hash = crypto.createHash('blake2b512').update(body).digest('base64');
const digestHeader = `BLAKE-512=${hash}`;

const signer = new PayloadSigner({
  subscriberId: 'isp2p.yocharge.com',
  uniqueKeyId: '76EU7xnKG51fhr9F5jvjF9KBfryJoqSucQfiwPHJMXWpqLL2rXybCw',
  signingPrivateKey: 'MPYM21Z4Kb4/2nfozOoiu4Uq3dL3EDlOzJsEO+IFrRg=',
});

const authHeader = signer.signPayload(body);

console.log('\nBODY:');
console.log(body);

console.log('\nDigest Header:');
console.log(digestHeader);

console.log('\nAuthorization Header:');
console.log(authHeader);

console.log(`
curl --location 'https://34.93.166.38.sslip.io/ledger/get' \\
--header 'Content-Type: application/json' \\
--header 'Digest: BLAKE-512=${hash}' \\
--header 'Authorization: ${authHeader}' \\
--data '${body}'
`);