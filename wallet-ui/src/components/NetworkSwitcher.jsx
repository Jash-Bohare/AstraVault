import { useWallet } from "../store/WalletContext";
import { NETWORKS } from "../config/networks";

export default function NetworkSwitcher() {
    const { networkId, setNetworkId } = useWallet();

    return (
        <div style={{ padding: "10px", background: "#f4f4f4", borderRadius: "8px", marginBottom: "20px" }}>
            <label style={{ marginRight: "10px", fontWeight: "bold" }}>Network:</label>
            <select
                value={networkId}
                onChange={(e) => setNetworkId(e.target.value)}
                style={{ padding: "5px", borderRadius: "4px" }}
            >
                {Object.values(NETWORKS).map((net) => (
                    <option key={net.id} value={net.id}>
                        {net.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
