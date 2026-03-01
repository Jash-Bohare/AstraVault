import * as bip39 from "bip39";
import { HDKey } from "@scure/bip32";
import { ethers } from "ethers";

// Generate Mnemonic
export function generateMnemonic() {
  return bip39.generateMnemonic(128);
}

// Derive Private Key
export async function derivePrivateKey(mnemonic, index = 0) {
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
export function privateKeyToAddress(privateKey) {
  const wallet = new ethers.Wallet(privateKey);
  return wallet.address;
}