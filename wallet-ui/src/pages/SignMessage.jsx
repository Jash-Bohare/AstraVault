import { useState } from "react";
import { useWallet } from "../store/WalletContext";
import { signPersonalMessage, verifyPersonalMessage } from "../core/wallet";
import { useNavigate } from "react-router-dom";

export default function SignMessage() {
    const { activePrivateKey, activeAddress } = useWallet();
    const [message, setMessage] = useState("");
    const [signature, setSignature] = useState("");
    const [recoveredAddress, setRecoveredAddress] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    async function handleSign() {
        if (!message) return;
        try {
            const sig = await signPersonalMessage(activePrivateKey, message);
            setSignature(sig);
            setRecoveredAddress("");
            setError("");
        } catch (err) {
            console.error(err);
            setError("Signing failed");
        }
    }

    function handleVerify() {
        try {
            const address = verifyPersonalMessage(message, signature);
            setRecoveredAddress(address);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Verification failed - signature might be invalid for this message");
        }
    }

    if (!activePrivateKey) return null;

    return (
        <div style={{ maxWidth: "500px", margin: "0 auto", padding: "20px" }}>
            <button
                onClick={() => navigate("/dashboard")}
                style={{ marginBottom: "20px", background: "none", border: "none", color: "#3b82f6", cursor: "pointer" }}
            >
                ← Back to Dashboard
            </button>

            <h2>Sign Message</h2>
            <p style={{ fontSize: "0.9rem", color: "#666" }}>
                Prove ownership of your address by signing a piece of data.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <textarea
                    placeholder="Enter message to sign..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    style={{ padding: "10px", borderRadius: "8px", border: "1px solid #ddd" }}
                />

                <button
                    onClick={handleSign}
                    disabled={!message}
                    style={{ background: "#3b82f6", color: "white", padding: "12px" }}
                >
                    Sign Message
                </button>

                {signature && (
                    <div style={{ marginTop: "20px" }}>
                        <h4 style={{ marginBottom: "5px" }}>Signature</h4>
                        <div style={{
                            background: "#f3f4f6",
                            padding: "10px",
                            borderRadius: "8px",
                            wordBreak: "break-all",
                            fontSize: "0.85rem",
                            border: "1px solid #e5e7eb"
                        }}>
                            {signature}
                        </div>

                        <button
                            onClick={handleVerify}
                            style={{ marginTop: "15px", width: "100%", background: "#10b981", color: "white" }}
                        >
                            Verify Signature
                        </button>
                    </div>
                )}

                {recoveredAddress && (
                    <div style={{
                        marginTop: "15px",
                        padding: "10px",
                        borderRadius: "8px",
                        background: recoveredAddress.toLowerCase() === activeAddress.toLowerCase() ? "#dcfce7" : "#fee2e2",
                        border: "1px solid",
                        borderColor: recoveredAddress.toLowerCase() === activeAddress.toLowerCase() ? "#86efac" : "#fecaca"
                    }}>
                        <strong>Recovered Address:</strong>
                        <code style={{ display: "block", fontSize: "0.85rem", marginTop: "5px" }}>{recoveredAddress}</code>
                        {recoveredAddress.toLowerCase() === activeAddress.toLowerCase() ? (
                            <p style={{ color: "#166534", margin: "5px 0 0 0", fontSize: "0.85rem" }}>✅ Matches your active address!</p>
                        ) : (
                            <p style={{ color: "#991b1b", margin: "5px 0 0 0", fontSize: "0.85rem" }}>❌ Does NOT match your active address.</p>
                        )}
                    </div>
                )}

                {error && <p style={{ color: "red" }}>{error}</p>}
            </div>
        </div>
    );
}
