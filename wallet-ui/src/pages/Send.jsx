import { useState, useEffect } from "react";
import { useWallet } from "../store/WalletContext";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import {
    getNonce,
    getGasData,
    estimateGas,
    broadcastTx
} from "../rpc/transaction";
import { provider } from "../rpc/provider";

export default function Send() {
    const { activePrivateKey, provider, network } = useWallet();
    const navigate = useNavigate();


    const [to, setTo] = useState("");
    const [amount, setAmount] = useState("");
    const [gasInfo, setGasInfo] = useState(null);
    const [status, setStatus] = useState("");

    useEffect(() => {
        if (!activePrivateKey) {
            navigate("/unlock");
        }
    }, [activePrivateKey, navigate]);

    if (!activePrivateKey) return null;


    async function prepareTransaction() {
        try {
            setStatus("Preparing transaction...");

            const wallet = new ethers.Wallet(activePrivateKey, provider);


            const nonce = await getNonce(wallet.address);
            const gasData = await getGasData();

            const tx = {
                to,
                value: ethers.parseEther(amount),
                nonce,
                maxFeePerGas: gasData.maxFeePerGas,
                maxPriorityFeePerGas: gasData.maxPriorityFeePerGas,
                chainId: (await provider.getNetwork()).chainId,
                type: 2
            };

            const gasLimit = await estimateGas(tx);

            setGasInfo({
                ...tx,
                gasLimit
            });

            setStatus("Gas estimated. Ready to send.");
        } catch (err) {
            console.error(err);
            setStatus("Error preparing transaction");
        }
    }

    async function sendTransaction() {
        try {
            setStatus("Signing transaction...");

            const wallet = new ethers.Wallet(activePrivateKey, provider);

            const signedTx = await wallet.signTransaction(gasInfo);


            setStatus("Broadcasting...");

            const txResponse = await broadcastTx(signedTx);

            setStatus("Transaction sent: " + txResponse.hash);

            await txResponse.wait();

            setStatus("Transaction confirmed!");
        } catch (err) {
            console.error(err);
            setStatus("Transaction failed");
        }
    }

    return (
        <div>
            <h2>Send {network.name} ({network.currency})</h2>

            <input
                placeholder="Recipient Address"
                value={to}
                onChange={(e) => setTo(e.target.value)}
            />

            <input
                placeholder={`Amount in ${network.currency}`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
            />

            <br /><br />

            <button onClick={prepareTransaction}>
                Estimate Gas
            </button>

            {gasInfo && (
                <>
                    <p><strong>Nonce:</strong> {gasInfo.nonce.toString()}</p>

                    <p><strong>Gas Limit:</strong> {gasInfo.gasLimit.toString()}</p>


                    <p>
                        <strong>Max Fee:</strong>{" "}
                        {ethers.formatUnits(gasInfo.maxFeePerGas, "gwei")} gwei
                    </p>

                    <p>
                        <strong>Priority Fee:</strong>{" "}
                        {ethers.formatUnits(gasInfo.maxPriorityFeePerGas, "gwei")} gwei
                    </p>

                    <p>
                        <strong>Estimated Tx Cost:</strong>{" "}
                        {ethers.formatEther(
                            gasInfo.gasLimit * gasInfo.maxFeePerGas
                        )} {network.currency}
                    </p>


                    <br />

                    <button onClick={sendTransaction}>
                        Confirm & Send
                    </button>
                </>
            )}

            <p>{status}</p>
        </div>
    );
}