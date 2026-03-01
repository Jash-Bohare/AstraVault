import { useState } from "react";
import {
  generateMnemonic,
  derivePrivateKey,
  privateKeyToAddress
} from "../core/wallet";
import { encryptPrivateKey } from "../utils/crypto";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../store/WalletContext";

export default function Create() {
  const { setWalletState } = useWallet();
  const [localMnemonic, setLocalMnemonic] = useState(null);


  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleGenerate() {
    const m = generateMnemonic();
    setLocalMnemonic(m);
  }

  async function handleContinue() {
    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const pk = await derivePrivateKey(localMnemonic);

      const address = privateKeyToAddress(pk);
      const encrypted = await encryptPrivateKey(localMnemonic, password);

      const accs = [{ address, index: 0 }];
      localStorage.setItem(
        "wallet",
        JSON.stringify({
          address,
          accounts: accs,
          crypto: encrypted,
          isMnemonic: true
        })
      );


      setWalletState({
        mnemonic: localMnemonic,
        accounts: accs,
        activeAddress: address,
        privateKey: pk
      });

      navigate("/dashboard");


    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Create Wallet</h2>

      {!localMnemonic && (
        <button onClick={handleGenerate}>
          Generate Wallet
        </button>
      )}

      {localMnemonic && (
        <>
          <h3>Your Secret Recovery Phrase</h3>

          <p style={{ background: "#eee", padding: "10px" }}>
            {localMnemonic}
          </p>


          <p>
            ⚠ Write this down. This is the only way to recover your wallet.
          </p>

          <input
            type="password"
            placeholder="Set Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <br /><br />

          <button onClick={handleContinue} disabled={loading}>
            {loading ? "Creating..." : "I Have Written It Down"}
          </button>
        </>
      )}
    </div>
  );
}