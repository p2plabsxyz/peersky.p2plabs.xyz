# CAPTCHA Implementation

## Architecture

### Security Flow
1. User clicks download button
2. CAPTCHA modal shown with mock challenge
3. User completes CAPTCHA
4. Token sent to `/api/download` endpoint
5. Backend verifies CAPTCHA token (or accepts mock-token for testing)
6. Backend generates signed, time-limited download token
7. Frontend receives signed URL
8. Download initiated with time-limited token

## Features

### ✅ Backend Verification
- CAPTCHA token verified server-side via Cap.js API
- Mock token support for local testing

### ✅ Signed Download URLs
- Cryptographic HMAC-SHA256 signatures
- Prevents URL tampering

### ✅ Time-Limited Access
- Tokens expire after 10 minutes
- Automatic cleanup of expired tokens

### ✅ Single-Use Protection
- Tokens tracked in-memory (can be upgraded to Redis/DB)
- Token reuse detection

### ✅ File Validation
- Whitelist of allowed extensions
- Path traversal protection

## Environment Variables

```env
DOWNLOAD_SECRET=your_cap_secret_key_here
SIGNING_SECRET=your_signing_secret_key_here
```

## Deployment

### Vercel
1. Set environment variables in Vercel dashboard
2. Deploy: `vercel --prod`

### Local Testing
1. Copy `.env.example` to `.env`
2. Fill in secrets
3. Run: `vercel dev` or `python -m http.server`

## API Endpoints

### POST /api/download
**Request:**
```json
{
  "captchaToken": "token-from-captcha",
  "requestedFile": "Peersky-Browser-1.0.0.dmg",
  "tag": "v1.0.0"
}
```

**Response:**
```json
{
  "downloadUrl": "https://github.com/.../file.dmg",
  "token": "abc123...",
  "expiresAt": "2025-10-26T12:00:00Z",
  "signature": "def456..."
}
```

### GET /api/verify-download
**Query Params:**
- token
- file
- tag
- expiry
- signature

**Response:**
```json
{
  "valid": true
}
```

## Security Notes

1. **Production**: Change default secrets in environment variables
2. **HTTPS**: Always use HTTPS in production
3. **Rate Limiting**: Consider adding rate limiting per IP
4. **Token Storage**: Upgrade to Redis/DB for multi-instance deployments
5. **Logging**: Monitor download attempts for abuse patterns

## Testing

### Mock Mode (Local)
- Uses "mock-token" instead of real CAPTCHA
- No Cap.js API calls
- Direct GitHub URLs returned

### Production Mode
- Real Cap.js verification
- Signed URLs with expiry
- Token tracking enabled
