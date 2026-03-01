import { ethers } from "ethers";

export function getProvider(rpcUrl, network = null) {
    // 🛡️ Using staticNetwork prevents ethers from spamming network detection calls
    // especially useful when a developer node (like Hardhat) is offline.
    return new ethers.JsonRpcProvider(rpcUrl, network ? {
        chainId: network.chainId,
        name: network.id
    } : undefined, {
        staticNetwork: network ? true : false
    });
}


// Default provider for backwards compatibility (will be replaced by context usage)
export const provider = getProvider("https://sepolia.infura.io/v3/637f3ed9f4364454a1cb9e5d0627c2fa");
