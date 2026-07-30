import crypto from "crypto";

const SESSION_TTL_MS = 60 * 60 * 1000; // 1 hour

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Missing SESSION_SECRET environment variable.");
  }
  return secret;
}

export function createSessionToken(matricNumber) {
  const expires = Date.now() + SESSION_TTL_MS;
  const payload = `${matricNumber}.${expires}`;
  const signature = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");
  return `${payload}.${signature}`;
}

export function verifySessionToken(token) {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [matricNumber, expiresStr, signature] = parts;
  const payload = `${matricNumber}.${expiresStr}`;
  const expected = crypto
    .createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  const expires = Number(expiresStr);
  if (!expires || Date.now() > expires) return null;

  return matricNumber;
}
