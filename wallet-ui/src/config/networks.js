export const NETWORKS = {
    sepolia: {
        id: "sepolia",
        name: "Sepolia",
        rpcUrl: "https://sepolia.infura.io/v3/637f3ed9f4364454a1cb9e5d0627c2fa",
        chainId: 11155111,
        explorer: "https://sepolia.etherscan.io",
        currency: "ETH"
    },
    mainnet: {
        id: "mainnet",
        name: "Ethereum Mainnet",
        rpcUrl: "https://mainnet.infura.io/v3/637f3ed9f4364454a1cb9e5d0627c2fa",
        chainId: 1,
        explorer: "https://etherscan.io",
        currency: "ETH"
    },
    hardhat: {
        id: "hardhat",
        name: "Hardhat",
        rpcUrl: "http://127.0.0.1:8545",
        chainId: 31337,
        explorer: null,
        currency: "ETH"
    }
};

export const DEFAULT_NETWORK = "sepolia";
