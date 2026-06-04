const CryptoJS = require('crypto-js');
const { sha3_512 } = require('js-sha3');
const config = require('../config/config');
const logger = require('../utils/logger');

class EncryptionService {
  constructor() {
    this.secretKey = config.encryption.key;
    if (!this.secretKey || this.secretKey.includes('change')) {
      logger.warn('ENCRYPTION WARNING: Using default encryption key. Set ENCRYPTION_KEY in .env for production.');
    }
  }

  encrypt(plainText) {
    try {
      if (!plainText) return '';
      const encrypted = CryptoJS.AES.encrypt(
        plainText.toString(),
        this.secretKey,
        {
          mode: CryptoJS.mode.CBC,
          padding: CryptoJS.pad.Pkcs7,
        }
      ).toString();
      return encrypted;
    } catch (error) {
      logger.error('Encryption error:', error.message);
      throw new Error('Failed to encrypt data');
    }
  }

  decrypt(cipherText) {
    try {
      if (!cipherText) return '';
      const bytes = CryptoJS.AES.decrypt(cipherText, this.secretKey, {
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      if (!decrypted) {
        throw new Error('Decryption produced empty result — key mismatch or corrupted data');
      }
      return decrypted;
    } catch (error) {
      logger.error('Decryption error:', error.message);
      throw new Error('Failed to decrypt data');
    }
  }

  encryptObject(obj) {
    try {
      const jsonString = JSON.stringify(obj);
      return this.encrypt(jsonString);
    } catch (error) {
      logger.error('Object encryption error:', error.message);
      throw new Error('Failed to encrypt object');
    }
  }

  decryptObject(cipherText) {
    try {
      const jsonString = this.decrypt(cipherText);
      return JSON.parse(jsonString);
    } catch (error) {
      logger.error('Object decryption error:', error.message);
      throw new Error('Failed to decrypt object');
    }
  }

  hashSHA256(data) {
    return CryptoJS.SHA256(data).toString();
  }

  hashSHA1(data) {
    return CryptoJS.SHA1(data).toString();
  }

  hashMD5(data) {
    return CryptoJS.MD5(data).toString();
  }

  generateHMAC(data) {
    return CryptoJS.HmacSHA256(data, this.secretKey).toString();
  }

  hashKeccak512(data) {
    return sha3_512(data);
  }

  maskEmail(email) {
    if (!email || !email.includes('@')) return email;
    const [local, domain] = email.split('@');
    const maskedLocal = local.length > 2
      ? local[0] + '*'.repeat(Math.min(local.length - 2, 6)) + local[local.length - 1]
      : local[0] + '*';
    return `${maskedLocal}@${domain}`;
  }

  maskPhone(phone) {
    if (!phone) return phone;
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length <= 4) return '*'.repeat(cleaned.length);
    return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
  }

  maskGeneric(value, visibleStart = 2, visibleEnd = 2) {
    if (!value || value.length <= visibleStart + visibleEnd) return value;
    const masked = value.slice(0, visibleStart) +
      '*'.repeat(Math.min(value.length - visibleStart - visibleEnd, 10)) +
      value.slice(-visibleEnd);
    return masked;
  }
}

module.exports = new EncryptionService();
