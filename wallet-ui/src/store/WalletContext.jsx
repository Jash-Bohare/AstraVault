import { createContext, useState, useContext, useEffect, useMemo } from "react";
import { NETWORKS, DEFAULT_NETWORK } from "../config/networks";
import { getProvider } from "../rpc/provider";
import { derivePrivateKey, privateKeyToAddress } from "../core/wallet";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [networkId, setNetworkId] = useState(() => {
    return localStorage.getItem("networkId") || DEFAULT_NETWORK;
  });

  const [accounts, setAccounts] = useState(() => {
    const stored = localStorage.getItem("wallet");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.accounts || [{ address: parsed.address, index: 0 }];
    }
    return [];
  });

  const [activeAddress, setActiveAddress] = useState(() => {
    return localStorage.getItem("activeAddress") || (accounts.length > 0 ? accounts[0].address : null);
  });

  const [mnemonic, setMnemonic] = useState(null); // Keep mnemonic in memory while session is active
  const [activePrivateKey, setActivePrivateKey] = useState(null);

  const network = useMemo(() => NETWORKS[networkId], [networkId]);
  const provider = useMemo(() => getProvider(network.rpcUrl, network), [network]);


  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("networkId", networkId);
  }, [networkId]);

  useEffect(() => {
    localStorage.setItem("activeAddress", activeAddress);
  }, [activeAddress]);

  // Sync state FROM localStorage (handles New Wallet creation)
  useEffect(() => {
    const stored = localStorage.getItem("wallet");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.accounts && accounts.length === 0) {
        setAccounts(parsed.accounts);
        if (!activeAddress) setActiveAddress(parsed.accounts[0].address);
      }
    }
  }, [accounts.length, activeAddress]);


  const addAccount = async () => {
    if (!mnemonic) return;
    const nextIndex = accounts.length;
    const pk = await derivePrivateKey(mnemonic, nextIndex);
    const address = privateKeyToAddress(pk);

    const newAccount = { address, index: nextIndex };
    const updatedAccounts = [...accounts, newAccount];

    setAccounts(updatedAccounts);
    setActiveAddress(address);
    setActivePrivateKey(pk);

    // Update persistent wallet metadata (not the crypto part, just accounts list)
    const stored = JSON.parse(localStorage.getItem("wallet"));
    localStorage.setItem("wallet", JSON.stringify({
      ...stored,
      accounts: updatedAccounts
    }));
  };

  const switchAccount = async (address) => {
    if (!mnemonic) return;
    const account = accounts.find(a => a.address === address);
    if (account) {
      const pk = await derivePrivateKey(mnemonic, account.index);
      setActivePrivateKey(pk);
      setActiveAddress(address);
    }
  };

  const setWalletState = ({ mnemonic: m, accounts: accs, activeAddress: addr, privateKey: pk }) => {
    if (m) setMnemonic(m);
    if (accs) setAccounts(accs);
    if (addr) setActiveAddress(addr);
    if (pk) setActivePrivateKey(pk);
  };

  return (
    <WalletContext.Provider value={{
      network,
      networkId,
      setNetworkId,
      provider,
      accounts,
      activeAddress,
      activePrivateKey,
      setActivePrivateKey,
      setActiveAddress,
      setAccounts,
      addAccount,
      switchAccount,
      mnemonic,
      setMnemonic,
      setWalletState
    }}>
      {children}
    </WalletContext.Provider>
  );

}

export function useWallet() {
  return useContext(WalletContext);
}
