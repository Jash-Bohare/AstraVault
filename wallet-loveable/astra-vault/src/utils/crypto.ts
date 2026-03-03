export interface EncryptedData {
  version: number;
  kdf: string;
  iterations: number;
  ciphertext: string;
  iv: string;
  salt: string;
}

function bufToBase64(buffer: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuf(base64: string): Uint8Array {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

const getCrypto = () => {
  const c = window.crypto;
  if (!c || !c.subtle) {
    throw new Error("Crypto API (subtle) not available. Ensure you are using a secure context (localhost or HTTPS).");
  }
  return c;
};

async function deriveKey(password: string, salt: Uint8Array, iterations: number): Promise<CryptoKey> {
  const crypto = getCrypto();
  const enc = new TextEncoder();

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as any,
      iterations,
      hash: "SHA-256"
    },
    keyMaterial,
    {
      name: "AES-GCM",
      length: 256
    },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptPrivateKey(privateKey: string, password: string): Promise<EncryptedData> {
  const crypto = getCrypto();
  const enc = new TextEncoder();

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 310000;

  const key = await deriveKey(password, salt, iterations);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as any },
    key,
    enc.encode(privateKey)
  );

  return {
    version: 1,
    kdf: "pbkdf2",
    iterations,
    ciphertext: bufToBase64(encrypted),
    iv: bufToBase64(iv),
    salt: bufToBase64(salt)
  };
}

export async function decryptPrivateKey(data: EncryptedData, password: string): Promise<string> {
  const crypto = getCrypto();
  const iv = base64ToBuf(data.iv);
  const salt = base64ToBuf(data.salt);
  const ciphertext = base64ToBuf(data.ciphertext);
  const iterations = data.iterations;

  const key = await deriveKey(password, salt, iterations);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as any },
    key,
    ciphertext as any
  );

  return new TextDecoder().decode(decrypted);
}


