import { useState } from "react";
import { decryptPrivateKey } from "../utils/crypto";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../store/WalletContext";
import { derivePrivateKey } from "../core/wallet";


export default function Unlock() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Correct hook usage
  const { setWalletState } = useWallet();



  async function handleUnlock() {
    try {
      const stored = JSON.parse(localStorage.getItem("wallet"));

      if (!stored) {
        setError("No wallet found");
        return;
      }

      const decrypted = await decryptPrivateKey(stored.crypto, password);
      const accs = stored.accounts || [{ address: stored.address, index: 0 }];
      const currentAccount = accs.find(a => a.address === stored.address) || accs[0];

      let pk = decrypted;
      if (stored.isMnemonic) {
        pk = await derivePrivateKey(decrypted, currentAccount.index);
      }

      setWalletState({
        mnemonic: stored.isMnemonic ? decrypted : null,
        accounts: accs,
        activeAddress: stored.address,
        privateKey: pk
      });

      navigate("/dashboard");


    } catch (err) {
      console.error("Decrypt failed:", err);
      setError("Invalid password");
    }
  }

  return (
    <div>
      <h2>Unlock Wallet</h2>

      <input
        type="password"
        placeholder="Enter Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={handleUnlock}>
        Unlock
      </button>

      {error && <p>{error}</p>}
    </div>
  );
}