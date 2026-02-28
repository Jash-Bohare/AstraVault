import { createContext, useState, useContext, useEffect } from "react";

const WalletContext = createContext();

export function WalletProvider({ children }) {
  const [privateKey, setPrivateKey] = useState(null);

  // Auto-lock after 5 minutes
  useEffect(() => {
    let timer;

    if (privateKey) {
      timer = setTimeout(() => {
        setPrivateKey(null);
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => clearTimeout(timer);
  }, [privateKey]);

  return (
    <WalletContext.Provider value={{ privateKey, setPrivateKey }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}