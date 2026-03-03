import { ethers } from "ethers";

export function getProvider(rpcUrl: string, network: any = null): ethers.JsonRpcProvider {
    // 🛡️ Using staticNetwork prevents ethers from spamming network detection calls
    // especially useful when a developer node (like Hardhat) is offline.
    return new ethers.JsonRpcProvider(rpcUrl, network ? {
        chainId: network.chainId,
        name: network.id
    } : undefined, {
        staticNetwork: network ? true : false
    });
}

// Default provider for backwards compatibility
export const provider = getProvider(`https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_ID}`);

