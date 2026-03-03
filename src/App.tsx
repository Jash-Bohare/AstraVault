import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import SendPage from "@/pages/SendPage";
import TokensPage from "@/pages/TokensPage";
import SignMessagePage from "@/pages/SignMessagePage";
import DeveloperPanel from "@/pages/DeveloperPanel";
import SettingsPage from "@/pages/SettingsPage";
import UnlockPage from "@/pages/UnlockPage";
import NotFound from "@/pages/NotFound";
import { WalletProvider, useWallet } from "./store/WalletContext";
import OnboardingPage from "@/pages/OnboardingPage";

const queryClient = new QueryClient();

const AppContent = () => {
  const { mnemonic, activePrivateKey, setWalletState } = useWallet();
  const hasWallet = !!localStorage.getItem("wallet");
  const isUnlocked = !!mnemonic || !!activePrivateKey;

  if (!hasWallet) {
    return <OnboardingPage />;
  }

  if (!isUnlocked) {
    return <UnlockPage />;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/send" element={<SendPage />} />
        <Route path="/tokens" element={<TokensPage />} />
        <Route path="/sign" element={<SignMessagePage />} />
        <Route path="/developer" element={<DeveloperPanel />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <BrowserRouter>
            <Toaster />
            <Sonner />
            <AppContent />
          </BrowserRouter>
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
