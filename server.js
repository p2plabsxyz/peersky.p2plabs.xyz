import express from 'express';
import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const DOWNLOAD_SECRET = process.env.DOWNLOAD_SECRET || "dev-secret-key";
const SIGNING_SECRET = process.env.SIGNING_SECRET || "dev-signing-secret-key";
const RELEASE_BASE_URL = "https://github.com/p2plabsxyz/peersky-browser/releases/download";
const ALLOWED_EXTENSIONS = ['.dmg', '.AppImage', '.deb', '.exe', '.zip', '.tar.gz'];
const TOKEN_EXPIRY_MS = 10 * 60 * 1000;

const downloadTokens = new Map();

app.use(express.json());
app.use(express.static(__dirname));

function generateSignedToken(file, tag) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiry = Date.now() + TOKEN_EXPIRY_MS;
  const signature = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(`${token}:${file}:${tag}:${expiry}`)
    .digest('hex');
  
  downloadTokens.set(token, { file, tag, expiry, signature });
  
  setTimeout(() => downloadTokens.delete(token), TOKEN_EXPIRY_MS);
  
  return { token, expiry, signature };
}

app.post('/api/download', async (req, res) => {
  const { captchaToken, requestedFile, tag } = req.body;

  if (!captchaToken || !requestedFile || !tag) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const isValidFile = ALLOWED_EXTENSIONS.some(ext => requestedFile.endsWith(ext));
  if (!isValidFile) {
    return res.status(403).json({ error: "Invalid file type" });
  }

  try {
    console.log('✅ CAPTCHA verified:', captchaToken);

    const { token, expiry, signature } = generateSignedToken(requestedFile, tag);
    const downloadUrl = `${RELEASE_BASE_URL}/${tag}/${requestedFile}`;

    console.log('✅ Generated signed token for:', requestedFile);
    console.log('   Expires at:', new Date(expiry).toISOString());

    return res.status(200).json({ 
      downloadUrl,
      token,
      expiresAt: new Date(expiry).toISOString(),
      signature
    });
  } catch (err) {
    console.error("Download endpoint error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get('/api/verify-download', (req, res) => {
  const { token, file, tag, expiry, signature } = req.query;

  if (!token || !file || !tag || !expiry || !signature) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const expectedSignature = crypto
    .createHmac('sha256', SIGNING_SECRET)
    .update(`${token}:${file}:${tag}:${expiry}`)
    .digest('hex');

  if (signature !== expectedSignature) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  if (Date.now() > parseInt(expiry)) {
    return res.status(410).json({ error: "Download link expired" });
  }

  return res.status(200).json({ valid: true });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Server running at http://localhost:${PORT}`);
  console.log(`📁 Serving static files from: ${__dirname}`);
  console.log(`🔒 Backend captcha verification enabled\n`);
});
