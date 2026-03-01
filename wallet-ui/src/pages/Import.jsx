import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useWallet } from "../store/WalletContext";
import { derivePrivateKey, privateKeyToAddress } from "../core/wallet";
import { encryptPrivateKey } from "../utils/crypto";
import * as bip39 from "bip39";


export default function Import() {
  const { setWalletState } = useWallet();
  const [localMnemonic, setLocalMnemonic] = useState("");

  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  async function handleImport() {
    if (!password) {
      alert("Please set a password");
      return;
    }

    try {
      let privateKey;

      // If mnemonic provided
      if (localMnemonic) {
        const valid = bip39.validateMnemonic(localMnemonic);
        if (!valid) {
          alert("Invalid mnemonic phrase");
          return;
        }
        privateKey = await derivePrivateKey(localMnemonic);
      }


      // If private key provided
      else if (privateKeyInput) {
        privateKey = privateKeyInput.startsWith("0x")
          ? privateKeyInput
          : "0x" + privateKeyInput;
      }

      else {
        alert("Enter mnemonic OR private key");
        return;
      }

      const address = privateKeyToAddress(privateKey);
      const encrypted = await encryptPrivateKey(localMnemonic || privateKey, password);

      const accs = [{ address, index: 0 }];
      localStorage.setItem(
        "wallet",
        JSON.stringify({
          address,
          accounts: accs,
          crypto: encrypted,
          isMnemonic: !!localMnemonic
        })
      );

      setWalletState({
        mnemonic: localMnemonic || null,
        accounts: accs,
        activeAddress: address,
        privateKey: privateKey
      });

      navigate("/dashboard");



    } catch (err) {
      console.error(err);
      alert("Import failed");
    }
  }

  return (
    <div>
      <h2>Import Wallet</h2>

      <textarea
        placeholder="Enter 12-word mnemonic"
        value={localMnemonic}
        onChange={(e) => setLocalMnemonic(e.target.value)}
      />


      <br /><br />

      <input
        type="text"
        placeholder="OR Enter Private Key"
        value={privateKeyInput}
        onChange={(e) => setPrivateKeyInput(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Set Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={handleImport}>
        Import Wallet
      </button>
    </div>
  );
}