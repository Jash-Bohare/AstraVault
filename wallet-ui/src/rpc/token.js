import { ethers } from "ethers";
import { provider } from "./provider";

// Minimal ERC20 ABI
const ERC20_ABI = [
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address,uint256) returns (bool)"
];

// 1️⃣ Fetch Token Metadata
export async function getTokenMetadata(tokenAddress, customProvider = provider) {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, customProvider);


    const [name, symbol, decimals] = await Promise.all([
        contract.name(),
        contract.symbol(),
        contract.decimals()
    ]);

    return {
        name,
        symbol,
        decimals: Number(decimals)
    };
}

// 2️⃣ Fetch Token Balance
export async function getTokenBalance(tokenAddress, userAddress, customProvider = provider) {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, customProvider);

    return await contract.balanceOf(userAddress);
}

// 3️⃣ Prepare Token Transfer (returns populated tx)
export async function prepareTokenTransfer(
    tokenAddress,
    to,
    amount,
    decimals,
    signer
) {
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, signer);

    const value = ethers.parseUnits(amount, decimals);

    return await contract.transfer.populateTransaction(to, value);
}