import * as bip39 from "bip39";
import { HDKey } from "@scure/bip32";
import { ethers } from "ethers";
import { Buffer } from "buffer";

// Generate Mnemonic
export function generateMnemonic(): string {
  return bip39.generateMnemonic(128);
}

// Derive Private Key
export async function derivePrivateKey(mnemonic: string, index: number = 0): Promise<string> {
  const seed = await bip39.mnemonicToSeed(mnemonic);
  const hd = HDKey.fromMasterSeed(seed);
  const child = hd.derive(`m/44'/60'/0'/0/${index}`);

  if (!child.privateKey) {
    throw new Error("Private key derivation failed");
  }

  // Convert Uint8Array → hex string
  return "0x" + Buffer.from(child.privateKey).toString("hex");
}

// Convert Private Key → Address
export function privateKeyToAddress(privateKey: string): string {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}

// Sign Personal Message (EIP-191)
export async function signPersonalMessage(privateKey: string, message: string): Promise<string> {
  const wallet = new ethers.Wallet(privateKey);
  return await wallet.signMessage(message);
}

// Verify Personal Message
export function verifyPersonalMessage(message: string, signature: string): string {
  return ethers.verifyMessage(message, signature);
}

