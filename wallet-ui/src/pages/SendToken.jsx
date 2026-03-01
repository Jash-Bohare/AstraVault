import { useState, useEffect } from "react";
import { useWallet } from "../store/WalletContext";
import { useNavigate, useParams } from "react-router-dom";
import { ethers } from "ethers";
import { prepareTokenTransfer } from "../rpc/token";

import { broadcastTx } from "../rpc/transaction";

export default function SendToken() {
  const { activePrivateKey, provider, networkId } = useWallet();
  const navigate = useNavigate();

  const { address } = useParams(); // token contract address


  const [token, setToken] = useState(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState("");

  // 🔐 Protect route
  useEffect(() => {
    if (!activePrivateKey) {
      navigate("/unlock");
      return;
    }


    const stored = JSON.parse(localStorage.getItem("wallet"));
    const networkScopedTokens = (stored.networkTokens && stored.networkTokens[networkId]) || [];
    const found = networkScopedTokens.find(t => t.address === address);


    if (!found) {
      navigate("/dashboard");
      return;
    }

    setToken(found);
  }, [activePrivateKey, address, navigate]);

  if (!token) return null;

  async function send() {
    try {
      setStatus("Preparing transaction...");

      const signer = new ethers.Wallet(activePrivateKey, provider);


      const txData = await prepareTokenTransfer(
        token.address,
        to,
        amount,
        token.decimals,
        signer
      );

      const gasLimit = await provider.estimateGas({
        ...txData,
        from: signer.address
      });

      const feeData = await provider.getFeeData();

      const signedTx = await signer.signTransaction({
        ...txData,
        gasLimit,
        maxFeePerGas: feeData.maxFeePerGas,
        maxPriorityFeePerGas: feeData.maxPriorityFeePerGas,
        chainId: (await provider.getNetwork()).chainId,
        type: 2
      });

      setStatus("Broadcasting...");

      const response = await broadcastTx(signedTx);

      setStatus("Sent: " + response.hash);

      await response.wait();

      setStatus("Confirmed!");
    } catch (err) {
      console.error(err);
      setStatus("Transaction failed");
    }
  }

  return (
    <div>
      <h2>Send {token.symbol}</h2>

      <input
        placeholder="Recipient Address"
        value={to}
        onChange={(e) => setTo(e.target.value)}
      />

      <input
        placeholder={`Amount (${token.symbol})`}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <br /><br />

      <button onClick={send}>
        Send Token
      </button>

      <p>{status}</p>
    </div>
  );
}