import { provider as defaultProvider } from "./provider";
import { ethers } from "ethers";

export async function getBalance(address: string, provider: ethers.Provider = defaultProvider): Promise<number> {
  const balance = await provider.getBalance(address);
  return parseFloat(ethers.formatEther(balance));
}
