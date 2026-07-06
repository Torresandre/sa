const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || '';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey() {
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
    throw new Error('ENCRYPTION_KEY must be at least 32 characters');
  }
  return Buffer.from(ENCRYPTION_KEY.substring(0, 32), 'utf8');
}

function encrypt(plaintext) {
  if (!plaintext || plaintext === '') return plaintext;
  const key = getKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(ciphertext) {
  if (!ciphertext || ciphertext === '') return ciphertext;
  if (!ciphertext.includes(':')) return ciphertext;
  const key = getKey();
  const parts = ciphertext.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function encryptIfNotEmpty(value) {
  if (!value || value.trim() === '') return value;
  return encrypt(value);
}

function decryptIfNotEmpty(value) {
  if (!value || value.trim() === '') return value;
  if (!value.includes(':')) return value;
  try {
    return decrypt(value);
  } catch {
    return value;
  }
}

module.exports = { encrypt, decrypt, encryptIfNotEmpty, decryptIfNotEmpty };
