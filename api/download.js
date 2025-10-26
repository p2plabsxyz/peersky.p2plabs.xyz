import fetch from "node-fetch";

// Secret key from .env
const DOWNLOAD_SECRET = process.env.DOWNLOAD_SECRET;

// Base URL for your static releases
const RELEASE_BASE_URL = "https://github.com/p2plabsxyz/peersky-browser/releases/download";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { captchaToken, requestedFile } = req.body;

  if (!captchaToken || !requestedFile) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  try {
    // --- Verify CAPTCHA ---
    const verifyResponse = await fetch("https://api.capjs.com/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: captchaToken, secret: DOWNLOAD_SECRET }),
    });

    const verifyData = await verifyResponse.json();

    if (!verifyData.success) {
      return res.status(401).json({ error: "CAPTCHA verification failed" });
    }

    // --- Return download URL ---
    const downloadUrl = `${RELEASE_BASE_URL}/${requestedFile}`;

    return res.status(200).json({ downloadUrl });
  } catch (err) {
    console.error("Download endpoint error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
