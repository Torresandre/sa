const { encryptIfNotEmpty, decryptIfNotEmpty } = require('../services/encryption');

const ENCRYPTED_FIELDS = {
  Customer: ['phone', 'email'],
  Salon: ['phone', 'email'],
};

function isEncryptedField(model, field) {
  return ENCRYPTED_FIELDS[model]?.includes(field) || false;
}

function encryptFields(model, data) {
  if (!data || !ENCRYPTED_FIELDS[model]) return data;
  const encrypted = { ...data };
  for (const field of ENCRYPTED_FIELDS[model]) {
    if (encrypted[field] !== undefined && encrypted[field] !== null) {
      encrypted[field] = encryptIfNotEmpty(String(encrypted[field]));
    }
  }
  return encrypted;
}

function decryptFields(model, record) {
  if (!record || !ENCRYPTED_FIELDS[model]) return record;
  const decrypted = { ...record };
  for (const field of ENCRYPTED_FIELDS[model]) {
    if (decrypted[field] !== undefined && decrypted[field] !== null) {
      decrypted[field] = decryptIfNotEmpty(String(decrypted[field]));
    }
  }
  return decrypted;
}

function decryptRecords(model, result) {
  if (Array.isArray(result)) {
    return result.map(r => decryptFields(model, r));
  }
  return decryptFields(model, result);
}

function encryptionMiddleware(prisma) {
  return async (params, next) => {
    const { model, action, args } = params;

    if (!model || !ENCRYPTED_FIELDS[model]) {
      return next(params);
    }

    const encryptActions = ['create', 'createMany', 'update', 'updateMany', 'upsert'];
    const decryptActions = ['findMany', 'findUnique', 'findFirst', 'count'];

    if (encryptActions.includes(action)) {
      if (args.data) {
        if (Array.isArray(args.data)) {
          args.data = args.data.map(d => encryptFields(model, d));
        } else {
          args.data = encryptFields(model, args.data);
        }
      }

      if (action === 'upsert') {
        if (args.create) args.create = encryptFields(model, args.create);
        if (args.update) args.update = encryptFields(model, args.update);
      }
    }

    const result = await next(params);

    if (decryptActions.includes(action)) {
      return decryptRecords(model, result);
    }

    if (action === 'create' || action === 'createMany') {
      return decryptRecords(model, result);
    }

    if (action === 'update' || action === 'updateMany' || action === 'upsert') {
      return decryptRecords(model, result);
    }

    return result;
  };
}

module.exports = { encryptionMiddleware, ENCRYPTED_FIELDS };
