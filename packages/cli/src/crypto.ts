import crypto from "node:crypto";
import "@total-typescript/ts-reset/json-parse";

const algorithm = "aes-256-ctr";
const secretKey = "kE4jVuk7fvrTggbnNCs3eyNPnNaH7qsM";
const iv = crypto.randomBytes(16);

export function encrypt<const S>(text: S) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);

  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(text)),
    cipher.final(),
  ]);

  return JSON.stringify({
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
  });
}

export function decrypt(hash: any) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(hash.iv, "hex")
  );

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(hash.content, "hex")),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString());
}
