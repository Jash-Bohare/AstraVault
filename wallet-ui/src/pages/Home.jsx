import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const navigate = useNavigate();
    const [walletExists, setWalletExists] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem("wallet");
        if (stored) {
            setWalletExists(true);
        }
    }, []);

    return (
        <div>
            <h1>Wallet</h1>

            {!walletExists && (
                <>
                    <button onClick={() => navigate("/create")}>
                        Create New Wallet
                    </button>

                    <br /><br />

                    <button onClick={() => navigate("/import")}>
                        Import Wallet
                    </button>
                </>
            )}

            {walletExists && (
                <button onClick={() => navigate("/unlock")}>
                    Unlock Wallet
                </button>
            )}
        </div>
    );
}