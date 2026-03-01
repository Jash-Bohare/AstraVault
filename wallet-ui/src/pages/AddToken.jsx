import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useWallet } from "../store/WalletContext";
import { getTokenMetadata } from "../rpc/token";

export default function AddToken() {
  const { provider, networkId } = useWallet();


  const [address, setAddress] = useState("");
  const [tokenInfo, setTokenInfo] = useState(null);
  const navigate = useNavigate();

  async function handleFetch() {
    try {
      const metadata = await getTokenMetadata(address, provider);
      setTokenInfo(metadata);
    } catch (err) {

      console.error(err);
      alert("Invalid token contract");
    }
  }

  function handleAdd() {
    const stored = JSON.parse(localStorage.getItem("wallet"));
    const networkTokens = stored.networkTokens || {};

    const updated = {
      ...stored,
      networkTokens: {
        ...networkTokens,
        [networkId]: [...(networkTokens[networkId] || []), { address, ...tokenInfo }]
      }
    };

    localStorage.setItem("wallet", JSON.stringify(updated));
    navigate("/dashboard");
  }


  return (
    <div>
      <h2>Add Token</h2>

      <input
        placeholder="Token Contract Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      <button onClick={handleFetch}>
        Fetch Token Info
      </button>

      {tokenInfo && (
        <>
          <p>Name: {tokenInfo.name}</p>
          <p>Symbol: {tokenInfo.symbol}</p>
          <p>Decimals: {tokenInfo.decimals}</p>

          <button onClick={handleAdd}>
            Add Token
          </button>
        </>
      )}
    </div>
  );
}