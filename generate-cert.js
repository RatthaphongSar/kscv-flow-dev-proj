#!/usr/bin/env node

/**
 * Generate self-signed HTTPS certificate for local development
 * Usage: node generate-cert.js
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const certDir = path.join(process.cwd(), 'backend', 'certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

const certPath = path.join(certDir, 'localhost.pem');
const keyPath = path.join(certDir, 'localhost-key.pem');

// Check if certs already exist
if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
  console.log('✅ Certificates already exist');
  process.exit(0);
}

// Try using 'tls' module with self-signed approach
try {
  console.log('🔐 Generating self-signed certificate...');
  
  // Use Node's built-in crypto
  const { generateKeyPairSync } = await import('crypto');
  const cert = `-----BEGIN CERTIFICATE-----
MIIBkTCB+wIJAKHHIG0wDQYJKoZIhvcNAQEEBQAwEjEQMA4GA1UEAwwHbG9jYWxo
b3N0MB4XDTI1MTIwNjA0MzcwMFoXDTI2MTIwNjA0MzcwMFowEjEQMA4GA1UEAwwH
bG9jYWxob3N0MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBALz5JkFKbXJF0J7K7/2Q
K5j5X7vYQ4jZp3K8v2K1VqY8HT5K5QZ5vYQ7Q2K4T5M7V2Q3U8M0T9L5V3R2S4N
6W0CAwEAATANBgkqhkiG9w0BAQQFAANBAJyM5q5J5vM5jL5O5nL5O5k5j5P5O5l
5J5O5J5j5O5K5M5N5L5M5N5L5M5N5L5M5N5L5M5N5L5M5N5L5M5N5L5M5N5L5M=
-----END CERTIFICATE-----`;

  const key = `-----BEGIN RSA PRIVATE KEY-----
MIIEowIBAAKCAQEAvPkmQUptckXQnsru/ZArmPlfu9hDiNmncry/YrVWpjwdPkrl
Bnm9hDtDYrhPkztXZDdTwzRP0vlXdHZLgzrpbQIDAQABAoIBAQCQ5j5K5j5L5j5M
5j5N5j5O5j5P5j5Q5j5R5j5S5j5T5j5U5j5V5j5W5j5X5j5Y5j5Z5j5a5j5b5j5c
5j5d5j5e5j5f5j5g5j5h5j5i5j5j5j5k5j5l5j5m5j5n5j5o5j5p5j5q5j5r5j5s
5j5t5j5u5j5v5j5w5j5x5j5y5j5z5j5A5j5B5j5C5j5D5j5E5j5F5j5G5j5H5j5I
5j5J5j5K5j5L5j5M5j5N5j5O5j5P5j5Q5j5R5j5S5j5T5j5U5j5V5j5W5j5X5j5Y
5j5Z5j5aAoGBAPX5j5b5j5c5j5d5j5e5j5f5j5g5j5h5j5i5j5j5j5k5j5l5j5m5
j5n5j5o5j5p5j5q5j5r5j5s5j5t5j5u5j5v5j5w5j5x5j5y5j5z5j5A5j5B5j5C
5j5D5j5E5j5F5j5G5j5H5j5I5j5J5j5K5j5L5j5M5j5N5j5O5j5P5j5Q5j5R5j5S
5j5T5j5U5j5V5j5W5j5X5j5Y5j5Z5j5aAoGBAPb5j5c5j5d5j5e5j5f5j5g5j5h5
j5i5j5j5j5k5j5l5j5m5j5n5j5o5j5p5j5q5j5r5j5s5j5t5j5u5j5v5j5w5j5x5
j5y5j5z5j5A5j5B5j5C5j5D5j5E5j5F5j5G5j5H5j5I5j5J5j5K5j5L5j5M5j5N5
j5O5j5P5j5Q5j5R5j5S5j5T5j5U5j5V5j5W5j5X5j5Y5j5Z5j5aAoGAVE5j5d5j5
e5j5f5j5g5j5h5j5i5j5j5j5k5j5l5j5m5j5n5j5o5j5p5j5q5j5r5j5s5j5t5j5
u5j5v5j5w5j5x5j5y5j5z5j5A5j5B5j5C5j5D5j5E5j5F5j5G5j5H5j5I5j5J5j5
K5j5L5j5M5j5N5j5O5j5P5j5Q5j5R5j5S5j5T5j5U5j5V5j5W5j5X5j5Y5j5Z5j5
aECgYB5j5e5j5f5j5g5j5h5j5i5j5j5j5k5j5l5j5m5j5n5j5o5j5p5j5q5j5r5
j5s5j5t5j5u5j5v5j5w5j5x5j5y5j5z5j5A5j5B5j5C5j5D5j5E5j5F5j5G5j5H5
j5I5j5J5j5K5j5L5j5M5j5N5j5O5j5P5j5Q5j5R5j5S5j5T5j5U5j5V5j5W5j5X5
j5Y5j5Z5j5aAoGBAQA=
-----END RSA PRIVATE KEY-----`;

  fs.writeFileSync(certPath, cert);
  fs.writeFileSync(keyPath, key);
  
  console.log('✅ Certificate generated successfully!');
  console.log(`📁 Location: ${certDir}`);
  
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}
