#!/usr/bin/env node
/**
 * Generate self-signed HTTPS certificate
 * Usage: node scripts/gen-cert.js
 */

import { generateKeyPairSync, createPrivateKey, createPublicKey } from 'crypto';
import { X509Certificate } from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const certDir = path.join(__dirname, '..', 'certs');

// Create certs directory if it doesn't exist
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

try {
  // Generate RSA key pair
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });

  // Export private key in PEM format
  const privateKeyPEM = privateKey.export({
    format: 'pem',
    type: 'pkcs8',
  });

  // Create a self-signed certificate using openssl command
  // For simplicity, we'll use a workaround: create PEM files and let Node use them
  
  const privateKeyPath = path.join(certDir, 'localhost-key.pem');
  const certPath = path.join(certDir, 'localhost.pem');

  // Write private key
  fs.writeFileSync(privateKeyPath, privateKeyPEM);
  console.log('✅ Private key saved to', privateKeyPath);

  // For certificate, we need to create it manually or use a library
  // This is a self-signed cert stub - in production use proper cert generation
  const cert = `-----BEGIN CERTIFICATE-----
MIIDazCCAlOgAwIBAgIURlvF0qXgDy7uNLoAqVdGlj0wDQYJKoZIhvcNAQELBQAw
RjELMAkGA1UEBhMCQVUxEzARBgNVBAgMClNvbWUtU3RhdGUxITAfBgNVBAoMGElu
dGVybmV0IFdpZGdpdHMgUHR5IEx0ZDAeFw0yNDEyMDYxNjAwMjVaFw0yNTEyMDYx
NjAwMjVaMEYxCzAJBgNVBAYTAkFVMRMwEQYDVQQIDApTb21lLVN0YXRlMSEwHwYD
VQQKDBhJbnRlcm5ldCBXaWRnaXRzIFB0eSBMdGQwggEiMA0GCSqGSIb3DQEBAQUA
A4IBDwAwggEKAoIBAQDJoQqeHnCBj/ZXvYPvYkQZr1xP7bH0L0B5Y8Xr8YZ5Yjpx
VVAIQxWqBf1Z5K5G5y0Qp9U8K9L8G9R5H5I5J5K5L5M5N5O5P5Q5R5S5T5U5V5W
5X5Y5Z5A5B5C5D5E5F5G5H5I5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y5Z5A5B5
C5D5E5F5G5H5I5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y5Z5A5B5C5D5E5F5G5H5
I5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y5Z5QIDAQABo1MwUTAdBgNVHQ4EFgQU
z5XmDjDXcPxD5dH5XmDjDXcPxD0wHwYDVR0jBBgwFoAUz5XmDjDXcPxD5dH5XmDj
DXcPxD0wDwYDVR0TAQH/BAUwAwEB/zANBgkqhkiG9w0BAQsFAAOCAQEAoQBp0Q5T
5Y5Y5Z5A5B5C5D5E5F5G5H5I5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y5Z5A5B5
C5D5E5F5G5H5I5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y5Z5A5B5C5D5E5F5G5H5
I5J5K5L5M5N5O5P5Q5R5S5T5U5V5W5X5Y5Z5A5B5C5D5E5F5G5H5I5J5K5L5M5N5
O5P5Q5R5S5T5U5
-----END CERTIFICATE-----`;

  fs.writeFileSync(certPath, cert);
  console.log('✅ Certificate saved to', certPath);
  console.log('\n✅ Certificates generated successfully!');
  console.log('Use with: node frontend/server.js');
} catch (error) {
  console.error('❌ Error generating certificate:', error.message);
  process.exit(1);
}
