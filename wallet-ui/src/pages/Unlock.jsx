import { useState } from "react";
import { decryptPrivateKey } from "../utils/crypto";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../store/WalletContext";

export default function Unlock() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Correct hook usage
  const { setPrivateKey } = useWallet();

  async function handleUnlock() {
    try {
      const stored = JSON.parse(localStorage.getItem("wallet"));

      if (!stored) {
        setError("No wallet found");
        return;
      }

      const pk = await decryptPrivateKey(stored.crypto, password);

      setPrivateKey(pk);

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