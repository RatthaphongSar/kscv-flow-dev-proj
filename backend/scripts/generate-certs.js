import selfsigned from 'selfsigned';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Generating self-signed certificates...');

const attrs = [{ name: 'commonName', value: 'localhost' }];
// Simple options
const options = { days: 365 };

try {
  const pems = await selfsigned.generate(attrs, options);
  console.log('Pems keys:', Object.keys(pems));

  const certDir = path.join(__dirname, '..', 'certs');
  if (!fs.existsSync(certDir)) {
    fs.mkdirSync(certDir, { recursive: true });
  }

  if (pems.cert && pems.private) {
    fs.writeFileSync(path.join(certDir, 'localhost.pem'), pems.cert);
    fs.writeFileSync(path.join(certDir, 'localhost-key.pem'), pems.private);
    console.log('Certificates generated successfully.');
  } else {
    console.error('Failed to generate pems:', pems);
  }
} catch (error) {
  console.error('Error generating certs:', error);
}
