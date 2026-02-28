import { useState } from "react";
import {
  generateMnemonic,
  derivePrivateKey,
  privateKeyToAddress
} from "../core/wallet";
import { encryptPrivateKey } from "../utils/crypto";
import { useNavigate } from "react-router-dom";

export default function Create() {
  const [mnemonic, setMnemonic] = useState(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleGenerate() {
    const m = generateMnemonic();
    setMnemonic(m);
  }

  async function handleContinue() {
    if (!password || password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const pk = await derivePrivateKey(mnemonic);
      const address = privateKeyToAddress(pk);

      const encrypted = await encryptPrivateKey(pk, password);

      localStorage.setItem(
        "wallet",
        JSON.stringify({
          address,
          crypto: encrypted
        })
      );

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

      {!mnemonic && (
        <button onClick={handleGenerate}>
          Generate Wallet
        </button>
      )}

      {mnemonic && (
        <>
          <h3>Your Secret Recovery Phrase</h3>

          <p style={{ background: "#eee", padding: "10px" }}>
            {mnemonic}
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