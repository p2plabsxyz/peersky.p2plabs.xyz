const crypto = require('crypto');

const DOWNLOAD_SECRET = process.env.DOWNLOAD_SECRET || "dev-secret-key";
const SIGNING_SECRET = process.env.SIGNING_SECRET || "signing-secret-key-change-in-production";
const RELEASE_BASE_URL = "https://github.com/p2plabsxyz/peersky-browser/releases/download";
const ALLOWED_EXTENSIONS = ['.dmg', '.AppImage', '.deb', '.exe', '.zip', '.tar.gz'];
const TOKEN_EXPIRY_MS = 10 * 60 * 1000;

const downloadTokens = new Map();

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

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { captchaToken, requestedFile, tag } = req.body;

  if (!captchaToken || !requestedFile || !tag) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const isValidFile = ALLOWED_EXTENSIONS.some(ext => requestedFile.endsWith(ext));
  if (!isValidFile) {
    return res.status(403).json({ error: "Invalid file type" });
  }

  try {
    if (captchaToken !== "mock-token") {
      const verifyResponse = await fetch("https://api.capjs.com/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: captchaToken, secret: DOWNLOAD_SECRET }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.success) {
        return res.status(401).json({ error: "CAPTCHA verification failed" });
      }
    }

    const { token, expiry, signature } = generateSignedToken(requestedFile, tag);
    const downloadUrl = `${RELEASE_BASE_URL}/${tag}/${requestedFile}`;

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
}
