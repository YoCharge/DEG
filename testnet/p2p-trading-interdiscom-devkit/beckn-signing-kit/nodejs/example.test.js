'use strict';

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { PayloadSigner, verify } = require('./index');

describe('usage examples', () => {
  it('sign and attach to HTTP request', () => {
    // 1. Configure the signer with your keys from the YAML config.
    //    These come from the simplekeymanager / degledgerrecorder config.
    const signer = new PayloadSigner({
      subscriberId: 'isp2p.yocharge.com',
      uniqueKeyId: '76EU7xnKG51fhr9F5jvjF9KBfryJoqSucQfiwPHJMXWpqLL2rXybCw',
      signingPrivateKey: 'MPYM21Z4Kb4/2nfozOoiu4Uq3dL3EDlOzJsEO+IFrRg=',
    });

    // 2. Your beckn JSON payload (confirm, on_confirm, on_status, etc.)
    const payload = JSON.stringify({
      context: {
        action: 'confirm',
        domain: 'beckn.one:deg:p2p-trading:2.0.0',
        bap_id: 'isp2p.yocharge.com',
      },
      message: {
        order: { '@type': 'beckn:Order', 'beckn:orderStatus': 'CREATED' },
      },
    });

    // 3. Sign it — this is the entire SDK surface.
    const authHeader = signer.signPayload(payload);

    console.log('authHeader', authHeader);

    // 4. Attach to HTTP request (e.g., posting to ledger service).
    //    const res = await fetch('https://ledger.example.com/record', {
    //      method: 'POST',
    //      headers: {
    //        'Content-Type': 'application/json',
    //        'Authorization': authHeader,
    //      },
    //      body: payload,
    //    });

    assert.ok(authHeader.startsWith('Signature keyId="isp2p.yocharge.com|76EU7xnK'));
  });

  it('verify an incoming signed request', () => {
    const payload = JSON.stringify({ context: { action: 'confirm' } });

    // Sender side: sign
    const signer = new PayloadSigner({
      subscriberId: 'isp2p.yocharge.com',
      uniqueKeyId: '76EU7xnKG51fhr9F5jvjF9KBfryJoqSucQfiwPHJMXWpqLL2rXybCw',
      signingPrivateKey: 'MPYM21Z4Kb4/2nfozOoiu4Uq3dL3EDlOzJsEO+IFrRg=',
    });
    const authHeader = signer.signPayload(payload);

    // Receiver side: verify (look up public key from registry)
    const senderPublicKey = 'clTfwZEaLiF3JT3sQ/mu66l4TjU5RJbCBxKk6x0uTww=';
    verify(payload, authHeader, senderPublicKey); // throws on failure

    assert.ok(true, 'Signature valid!');
  });
});
