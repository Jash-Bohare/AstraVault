import { useEffect, useState } from "react";
import { useWallet } from "../store/WalletContext";
import { useNavigate } from "react-router-dom";
import { getBalance } from "../rpc/balance";
import { getTokenBalance } from "../rpc/token";
import { ethers } from "ethers";
import NetworkSwitcher from "../components/NetworkSwitcher";
import AccountSwitcher from "../components/AccountSwitcher";

export default function Dashboard() {
  const {
    activeAddress,
    activePrivateKey,
    provider,
    network,
    networkId,
    accounts
  } = useWallet();
  const navigate = useNavigate();


  const [ethBalance, setEthBalance] = useState("0");
  const [tokenBalances, setTokenBalances] = useState({});
  const [tokens, setTokens] = useState([]);
  const [networkError, setNetworkError] = useState(false);

  // 🔐 Route protection & Data sync
  useEffect(() => {
    const stored = localStorage.getItem("wallet");
    if (!stored || !activePrivateKey) return;

    const parsed = JSON.parse(stored);
    const networkScopedTokens = (parsed.networkTokens && parsed.networkTokens[networkId]) || [];
    setTokens(networkScopedTokens);

    if (activeAddress) {
      fetchEthBalance(activeAddress, provider);
      if (networkScopedTokens.length > 0) {
        fetchTokenBalances(networkScopedTokens, activeAddress, provider);
      }
    }

  }, [activePrivateKey, activeAddress, provider, networkId, navigate]);

  // 🔵 Fetch ETH balance
  async function fetchEthBalance(address, targetProvider) {
    try {
      const bal = await targetProvider.getBalance(address);
      // 🛡️ Only update if we are still on the same provider
      if (targetProvider !== provider) return;

      setEthBalance(ethers.formatEther(bal));
      setNetworkError(false);
    } catch (err) {
      if (targetProvider !== provider) return;
      console.error("ETH balance error:", err);
      setEthBalance("0");
      setNetworkError(true);
    }
  }



  // 🪙 Fetch all token balances
  async function fetchTokenBalances(tokenList, address, targetProvider) {
    const balances = {};

    for (let token of tokenList) {
      if (targetProvider !== provider) return;
      try {
        // 🔐 Check if contract exists on this network to avoid BAD_DATA
        const code = await targetProvider.getCode(token.address);
        if (code === "0x") {
          balances[token.address] = "Not found on network";
          continue;
        }

        const contract = new ethers.Contract(
          token.address,
          ["function balanceOf(address) view returns (uint256)"],
          targetProvider
        );

        const raw = await contract.balanceOf(address);
        balances[token.address] = ethers.formatUnits(
          raw,
          token.decimals
        );
      } catch (err) {
        if (targetProvider !== provider) return;
        console.error("Token balance error:", err);
        balances[token.address] = "Error";
      }
    }

    if (targetProvider === provider) {
      setTokenBalances(balances);
    }
  }



  if (!activeAddress) return null;

  return (
    <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
      <h2>Wallet Dashboard</h2>

      <NetworkSwitcher />
      <AccountSwitcher />

      {networkError && (
        <div style={{
          background: "#fee2e2",
          color: "#b91c1c",
          padding: "10px",
          borderRadius: "8px",
          marginBottom: "15px",
          fontSize: "0.9rem",
          border: "1px solid #f87171"
        }}>
          ⚠️ Connection error! Ensure your local node is running or switch to a public network.
        </div>
      )}

      <div style={{ background: "#f9fafb", padding: "15px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
        <p><strong>Active Address:</strong> <code style={{ fontSize: "0.85rem" }}>{activeAddress}</code></p>
        <p><strong>Balance:</strong> {ethBalance} {network.currency}</p>
      </div>


      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={() => navigate("/send")} style={{ flex: 1 }}>
          Send {network.currency}
        </button>
        <button onClick={() => navigate("/add-token")} style={{ flex: 1 }}>
          Add Token
        </button>
      </div>

      <br />

      {/* 🪙 Token Section */}
      <h3>Tokens</h3>

      {tokens.length > 0 ? (
        tokens.map((token, index) => (
          <div key={index} style={{
            marginBottom: "15px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div>
              <strong>{token.symbol}</strong>
              <p style={{ margin: 0, fontSize: "0.9rem", color: "#666" }}>
                {tokenBalances[token.address] || "Loading..."}
              </p>
            </div>

            <button
              onClick={() => navigate(`/send-token/${token.address}`)}
              style={{ padding: "5px 10px" }}
            >
              Send
            </button>
          </div>
        ))
      ) : (
        <p>No tokens added</p>
      )}

      <br />

      <button
        onClick={() => {
          localStorage.removeItem("wallet");
          localStorage.removeItem("activeAddress");
          window.location.href = "/";
        }}
        style={{ color: "red", background: "none", border: "none", cursor: "pointer", fontSize: "0.9rem" }}
      >
        Delete Wallet
      </button>
    </div>
  );
}
