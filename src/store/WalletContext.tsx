import { createContext, useState, useContext, useEffect, useMemo, ReactNode } from "react";
import { NETWORKS, DEFAULT_NETWORK } from "../config/networks";
import { getProvider } from "../rpc/provider";
import { derivePrivateKey, privateKeyToAddress } from "../core/wallet";

export interface Account {
  address: string;
  index: number;
}

export interface Token {
  name: string;
  symbol: string;
  decimals: number;
  contract: string;
  isCustom?: boolean;
}

export interface TransactionHistoryItem {
  hash: string;
  type: "send" | "receive" | "interaction";
  asset: string;
  amount: string;
  recipient: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
}

export interface WalletState {
  mnemonic: string | null;
  accounts: Account[];
  activeAddress: string | null;
  privateKey: string | null;
}

interface WalletContextType {
  network: any;
  networkId: string;
  setNetworkId: (id: string) => void;
  provider: any;
  accounts: Account[];
  activeAddress: string | null;
  activePrivateKey: string | null;
  setActivePrivateKey: (pk: string | null) => void;
  setActiveAddress: (addr: string | null) => void;
  setAccounts: (accs: Account[]) => void;
  addAccount: () => Promise<void>;
  switchAccount: (address: string) => Promise<void>;
  mnemonic: string | null;
  setMnemonic: (m: string | null) => void;
  setWalletState: (state: WalletState) => void;
  tokens: Token[];
  addToken: (token: Token) => void;
  removeToken: (contract: string) => void;
  history: TransactionHistoryItem[];
  addHistoryItem: (item: TransactionHistoryItem) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [networkId, setNetworkId] = useState(() => {
    return localStorage.getItem("networkId") || DEFAULT_NETWORK;
  });

  const [accounts, setAccounts] = useState<Account[]>(() => {
    const stored = localStorage.getItem("wallet");
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.accounts || [{ address: parsed.address, index: 0 }];
    }
    return [];
  });

  const [activeAddress, setActiveAddress] = useState<string | null>(() => {
    const storedAddr = localStorage.getItem("activeAddress");
    if (storedAddr) return storedAddr;
    return accounts.length > 0 ? accounts[0].address : null;
  });

  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [activePrivateKey, setActivePrivateKey] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>(() => {
    const stored = localStorage.getItem("tokens");
    const defaults: Token[] = [];
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return [...defaults, ...parsed];
      } catch (e) {
        return defaults;
      }
    }
    return defaults;
  });

  const [history, setHistory] = useState<TransactionHistoryItem[]>(() => {
    const stored = localStorage.getItem("transaction_history");
    return stored ? JSON.parse(stored) : [];
  });

  const network = useMemo(() => (NETWORKS as any)[networkId], [networkId]);
  const provider = useMemo(() => getProvider(network.rpcUrl, network), [network]);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem("networkId", networkId);
  }, [networkId]);

  useEffect(() => {
    if (activeAddress) {
      localStorage.setItem("activeAddress", activeAddress);
    }
  }, [activeAddress]);

  useEffect(() => {
    const customTokens = tokens.filter(t => t.isCustom);
    localStorage.setItem("tokens", JSON.stringify(customTokens));
  }, [tokens]);

  useEffect(() => {
    localStorage.setItem("transaction_history", JSON.stringify(history));
  }, [history]);

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

    const newAccount: Account = { address, index: nextIndex };
    const updatedAccounts = [...accounts, newAccount];

    setAccounts(updatedAccounts);
    setActiveAddress(address);
    setActivePrivateKey(pk);

    const storedStr = localStorage.getItem("wallet");
    if (storedStr) {
      const stored = JSON.parse(storedStr);
      localStorage.setItem("wallet", JSON.stringify({
        ...stored,
        accounts: updatedAccounts
      }));
    }
  };

  const switchAccount = async (address: string) => {
    if (!mnemonic) return;
    const account = accounts.find(a => a.address === address);
    if (account) {
      const pk = await derivePrivateKey(mnemonic, account.index);
      setActivePrivateKey(pk);
      setActiveAddress(address);
    }
  };

  const setWalletState = ({ mnemonic: m, accounts: accs, activeAddress: addr, privateKey: pk }: WalletState) => {
    setMnemonic(m);
    if (accs) setAccounts(accs);
    setActiveAddress(addr);
    setActivePrivateKey(pk);
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
      setWalletState,
      tokens,
      addToken: (token: Token) => setTokens(prev => [...prev, { ...token, isCustom: true }]),
      removeToken: (contract: string) => setTokens(prev => prev.filter(t => t.contract !== contract)),
      history,
      addHistoryItem: (item: TransactionHistoryItem) => setHistory(prev => [item, ...prev].slice(0, 50))
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}

