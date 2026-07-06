const crypto = require('crypto');
const fs = require('fs');
const { execSync } = require('child_process');

const DATA_DIR = 'C:\\Program Files\\PostgreSQL\\15\\data';

// Generate a self-signed cert using Node.js only
// Strategy: write a temp .cnf and use Node to generate key + cert via openssl-like method

// Actually, let's generate using node-forge approach with raw crypto
// We'll create a minimal valid X.509 self-signed cert

function base64DerToPem(der, label) {
  const b64 = der.toString('base64');
  const lines = b64.match(/.{1,64}/g).join('\n');
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----\n`;
}

function encodeLen(len) {
  if (len < 0x80) return Buffer.from([len]);
  const bytes = [];
  let v = len;
  while (v > 0) { bytes.unshift(v & 0xff); v >>= 8; }
  return Buffer.from([0x80 | bytes.length, ...bytes]);
}

function asn1Tag(tag, content) {
  return Buffer.concat([Buffer.from([tag]), encodeLen(content.length), content]);
}

function asn1Int(buf) {
  if (buf[0] & 0x80) buf = Buffer.concat([Buffer.from([0]), buf]);
  return asn1Tag(0x02, buf);
}

function asn1BitStr(data) {
  return asn1Tag(0x03, Buffer.concat([Buffer.from([0]), data]));
}

function asn1OctStr(data) {
  return asn1Tag(0x04, data);
}

function asn1Oid(oid) {
  const parts = oid.split('.').map(Number);
  const bytes = [parts[0] * 40 + parts[1]];
  for (let i = 2; i < parts.length; i++) {
    let v = parts[i];
    const tmp = [];
    do { tmp.unshift(v & 0x7f); v >>= 7; } while (v > 0);
    for (let j = 0; j < tmp.length - 1; j++) tmp[j] |= 0x80;
    bytes.push(...tmp);
  }
  return asn1Tag(0x06, Buffer.from(bytes));
}

function asn1Utf8(s) {
  return asn1Tag(0x0c, Buffer.from(s, 'ascii'));
}

function asn1Null() { return Buffer.from([0x05, 0x00]); }
function asn1Sequence(...items) { return asn1Tag(0x30, Buffer.concat(items)); }
function asn1Set(...items) { return asn1Tag(0x31, Buffer.concat(items)); }
function asn1Explicit(tag, content) { return asn1Tag(0xa0 | tag, content); }
function asn1UTCTime(d) {
  const s = d.toISOString().replace(/[-:T.Z]/g, '').substring(0, 13) + 'Z';
  return asn1Tag(0x17, Buffer.from(s));
}

// Generate key pair
const { privateKey: privKey, publicKey: pubKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'der' },
  privateKeyEncoding: { type: 'pkcs8', format: 'der' }
});

// Extract raw key components from SPKI
const spkiDer = pubKey;
// SPKI starts with: 30 82 ... SEQUENCE { SEQUENCE { OID, NULL }, BIT STRING { SEQUENCE { INTEGER, INTEGER } } }
// We need the modulus and exponent
const privKeyPem = base64DerToPem(privKey, 'PRIVATE KEY');

// Build subject/issuer name
const name = asn1Sequence(
  asn1Set(
    asn1Sequence(asn1Oid('2.5.4.3'), asn1Utf8('localhost')),
    asn1Sequence(asn1Oid('2.5.4.10'), asn1Utf8('Elaine Cabeleireiro')),
    asn1Sequence(asn1Oid('2.5.4.7'), asn1Utf8('Lisboa')),
    asn1Sequence(asn1Oid('2.5.4.6'), asn1Utf8('PT'))
  )
);

const now = new Date();
const notBefore = new Date(now.getTime() - 86400000);
const notAfter = new Date(now.getTime() + 3650 * 86400000);
const serial = crypto.randomBytes(16);

// SAN extension
const sanExt = asn1Sequence(
  asn1Oid('2.5.29.17'),    // subjectAltName
  asn1OctStr(asn1Sequence(
    asn1Tag(0x82, Buffer.from('localhost')),  // dNSName
    asn1Tag(0x87, Buffer.from([127, 0, 0, 1]))  // iPAddress
  ))
);

// Key usage extension
const kuExt = asn1Sequence(
  asn1Oid('2.5.29.15'),  // keyUsage
  asn1OctStr(asn1Tag(0x03, Buffer.from([0x03, 0x06, 0x80])))  // digitalSignature, keyEncipherment
);

// Basic constraints
const bcExt = asn1Sequence(
  asn1Oid('2.5.29.19'),  // basicConstraints
  asn1OctStr(asn1Sequence(asn1Tag(0x01, Buffer.from([0xff]))))  // cA: false
);

// Extensions
const extensions = asn1Explicit(3, asn1Sequence(sanExt, kuExt, bcExt));

// TBS Certificate
const tbs = asn1Sequence(
  asn1Explicit(0, Buffer.from([0xa0])),  // version v3
  asn1Int(serial),
  asn1Sequence(asn1Oid('1.2.840.113549.1.1.11'), asn1Null()),  // sha256WithRSA
  name,    // issuer
  asn1Sequence(asn1UTCTime(notBefore), as