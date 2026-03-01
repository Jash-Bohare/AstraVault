import { useWallet } from "../store/WalletContext";

export default function AccountSwitcher() {
    const { accounts, activeAddress, switchAccount, addAccount, mnemonic } = useWallet();

    return (
        <div style={{ padding: "10px", background: "#eef2ff", borderRadius: "8px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <h4 style={{ margin: 0 }}>Accounts</h4>
                {mnemonic && (
                    <button
                        onClick={addAccount}
                        style={{ padding: "4px 8px", fontSize: "0.8rem" }}
                    >
                        + Add Account
                    </button>
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {accounts.map((acc) => (
                    <div
                        key={acc.address}
                        onClick={() => switchAccount(acc.address)}
                        style={{
                            padding: "8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            background: activeAddress === acc.address ? "#3b82f6" : "white",
                            color: activeAddress === acc.address ? "white" : "black",
                            fontSize: "0.85rem",
                            border: "1px solid #ddd",
                            display: "flex",
                            justifyContent: "space-between"
                        }}
                    >
                        <span>Account {acc.index}</span>
                        <span style={{ opacity: 0.8 }}>
                            {acc.address.slice(0, 6)}...{acc.address.slice(-4)}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
