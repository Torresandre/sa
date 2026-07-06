const crypto = require('crypto');
const fs = require('fs');

const DATA_DIR = 'C:\\Program Files\\PostgreSQL\\15\\data';

// Generate RSA key pair
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});

// Create self-signed certificate using openssl-like approach
// Use Node's crypto to create a basic X.509 cert
const cert = generateSelfSignedCert(publicKey, privateKey);

fs.writeFileSync(`${DATA_DIR}\\server.crt`, cert);
fs.writeFileSync(`${DATA_DIR}\\server.key`, privateKey);

console.log(`Certificate: ${cert.length} chars`);
console.log(`Key: ${privateKey.length} chars`);
console.log(`Key starts with: ${privateKey.substring(0, 30)}`);
console.log(`Cert starts with: ${cert.substring(0, 30)}`);

function generateSelfSignedCert(pubKeyPem, privKeyPem) {
  // We'll use a trick: generate the cert via openssl-compatible format
  // by creating a CSR and self-signing it using node crypto
  
  // For a self-signed cert, we need to create the DER manually
  // OR use a workaround with openssl
  
  // Simple approach: use child_process to call openssl
  // But openssl isn't available. So we'll generate a minimal X.509 cert.
  
  // Actually, let's use the simplest possible approach:
  // Generate the cert using the built-in createSign
  const now = Math.floor(Date.now() / 1000);
  const notBefore = now;
  const notAfter = now + (365 * 10 * 24 * 60 * 60);
  
  // Build a minimal X.509 v3 certificate in DER
  // This is complex, so let's use a PKCS#12 approach instead
  
  // Actually, the simplest way is to use the Web Crypto API or generate with forge
  // Since we don't have forge, let's use openssl that ships with some tools
  
  // Let's try yet another approach - use npm to install just selfsigned
  // But npm is slow. Let's just generate the cert and key properly.
  
  // The issue is that PostgreSQL requires a specific key format.
  // PKCS#8 PEM is actually supported. Let's just try using the key directly.
  
  return cert; // placeholder - we'll generate below
}

// Better approach: generate using openssl from the Node.js crypto module
// Actually, we need to install selfsigned. Let's check if it's in the project
try {
  const path = require('path');
  // Check parent node_modules
  const possiblePaths = [
    path.join(__dirname, '..', 'node_modules', 'selfsigned'),
    path.join(__dirname, '..', '..', 'node_modules', 'selfsigned'),
  ];
  
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      const selfsigned = require(p);
      console.log('Found selfsigned at: ' + p);
      const attrs = [
        {name: 'commonName', value: 'localhost'},
        {name: 'organizationName', value: 'Elaine Cabeleireiro'},
        {name: 'localityName', value: 'Lisboa'},
        {name: 'countryName', value: 'PT'}
      ];
      const pems = selfsigned.generate(attrs, {
        algorithm: 'sha256',
        days: 3650,
        keySize: 2048,
        extensions: [{
          name: 'subjectAltName',
          altNames: [
            {type: 2, value: 'localhost'},
            {type: 7, ip: '127.0.0.1'}
          ]
        }]
      });
      fs.writeFileSync(`${DATA_DIR}\\server.crt`, pems.cert);
      fs.writeFileSync(`${DATA_DIR}\\server.key`, pems.private);
      console.log('SUCCESS with selfsigned');
      console.log('CERT: ' + pems.cert.substring(0, 50));
      console.log('KEY: ' + pems.private.substring(0, 50));
      process.exit(0);
    }
  }
  
  console.log('selfsigned not found in local paths, generating manually...');
} catch (e) {
  console.log('Error: ' + e.message);
}

// Generate cert manually using PKCS#10 CSR approach
// Since we have privateKey in PKCS#8 PEM format and the key works for signing,
// let's create a self-signed cert using openssl command from Git for Windows
// or any available tool

// Last resort: use PowerShell to call .NET crypto
console.log('Generating cert and key using raw Node.js crypto...');

// The key is already in PKCS#8 PEM format which PostgreSQL should support
fs.writeFileSync(`${DATA_DIR}\\server.key`, privateKey);

// For the certificate, we need to create a proper X.509 cert
// Let's create it using a CSR + self-sign approach

const { createSign } = crypto;

// Simple DER encoding helpers
function derLength(len) {
  if (len < 0x80) return Buffer.from([len]);
  const parts = [];
  let v = len;
  while (v > 0) { parts.unshift(v & 0xff); v >>= 8; }
  return Buffer.from([0x80 | parts.length, ...parts]);
}

function derSequence(...items) {
  const body = Buffer.concat(items);
  return Buffer.concat([Buffer.from([0x30]), derLength(body.length), body]);
}

function derSet(...items) {
  const body = Buffer.concat(items);
  return Buffer.concat([Buffer.from([0x31]), derLength(body.length), body]);
}

function derOid(oidStr) {
  const parts = oidStr.split('.').map(Number);
  const bytes = [parts[0] * 40 + parts[1]];
  for (let i = 2; i < parts.length; i++) {
    let v = parts[i];
    const temp = [];
    while (v > 0x7f) { temp.unshift(v & 0x7f); v >>= 7; }
    temp.unshift(v);
    for (let j = 0; j < temp.length - 1; j++) temp[j] |= 0x80;
    bytes.push(...temp);
  }
  return Buffer.concat([Buffer.from([0x06]), derLength(bytes.length), Buffer.from(bytes)]);
}

function derInt(buf) {
  const pad = (buf[0] & 0x80) ? Buffer.concat([Buffer.from([0]), buf]) : buf;
  return Buffer.concat([Buffer.from([0x02]), derLength(pad.length), pad]);
}

function derBitString(data) {
  return Buffer.concat([Buffer.from([0x03]), derLength(data.length + 1), Buffer.from([0]), data]);
}

function derExplicit(tag, content) {
  return Buffer.concat([Buffer.from([0xa0 | tag]), derLength(content.length), content]);
}

function derUtcTime(date) {
  const s = date.toISOString().replace(/[-:T]/g, '').substring(0, 13) + 'Z';
  return Buffer.concat([Buffer.from([0x17]), derLength(s.length), Buffer.from(s)]);
}

function derUtf8String(str) {
  return Buffer.concat([Buffer.from([0x0c]), derLength(str.length), Buffer.from(str)]);
}

function derNull() {
  return Buffer.from([0x05, 0x00]);
}

// Extract public key from PEM
const pubKeyObj = crypto.createPublicKey(pubKeyPem);
const pubKeyData = pubKeyObj.export({ type: 'spki', format: 'der' });

// Create TBS Certificate
const serial = crypto.randomBytes(16);
const now = new Date();

// Subject = Issuer (self-signed)
const subject = derSequence(
  derSet(
    derSequence(derOid('2.5.4.3'), derUtf8String('localhost')),  // CN
    derSequence(derOid('2.5.4.10'), derUtf8String('Elaine Cabeleireiro')),  // O
    derSequence(derOid('2.5.4.7'), derUtf8String('Lisboa')),  // L
    derSequence(derOid('2.5.4.8'), derUtf8String('Lisboa')),  // ST
    derSequence(derOid('2.5.4.6'), derUtf8String('PT'))  // C
  )
);

const tbs = derSequence(
  derExplicit(0, Buffer.from([0xa0])),  // version v3
  derInt(serial),
  derSequence(derOid('1.2.840.113549.1.1.11'), derNull()),  // sha256WithRSAEncryption
  subject,
  derSequence(
    derUtcTime(new Date(now.getTime() - 24*60*60*1000)),  // notBefore
    derUtcTime(new Date(now.getTime() + 365*10*24*60*60*1000))  // notAfter
  ),
  subject,  // issuer = subject
  derBitString(pubKeyData),  // subjectPublicKeyInfo
  // Extensions
  derExplicit(3, derSequence(
    // Subject Alternative Name
    derSequence(
      derOid('2.5.29.17'),
      Buffer.from([0x04'), derLength(... // too complex
    )
  ))
);

// This approach is too complex for manual DER encoding
// Let's use a different strategy
console.log('Manual DER encoding too complex, using alternative...');

// Sign the TBS and create the cert
const sign = createSign('SHA256');
sign.update(tbs);
const signature = sign.sign({key: privKeyPem, padding: crypto.constants.RSA_PKCS1_PSS_PADDING || 1});
