const crypto = require('crypto');

const SIGNING_SECRET = process.env.SIGNING_SECRET || "signing-secret-key-change-in-production";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
}
