function bufToBase64(buffer) {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

function base64ToBuf(base64) {
  return Uint8Array.from(atob(base64), c => c.charCodeAt(0));
}

async function deriveKey(password, salt, iterations) {
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
      salt,
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

export async function encryptPrivateKey(privateKey, password) {
  const enc = new TextEncoder();

  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iterations = 310000;

  const key = await deriveKey(password, salt, iterations);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
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

export async function decryptPrivateKey(data, password) {
  const iv = base64ToBuf(data.iv);
  const salt = base64ToBuf(data.salt);
  const ciphertext = base64ToBuf(data.ciphertext);
  const iterations = data.iterations;

  const key = await deriveKey(password, salt, iterations);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext
  );

  return new TextDecoder().decode(decrypted);
}