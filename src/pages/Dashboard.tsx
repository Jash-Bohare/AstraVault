import { ArrowUpRight, ArrowDownLeft, Send, PenTool, RefreshCcw, Shield, Coins, ExternalLink, Clock, History, LayoutDashboard, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/store/WalletContext";
import { useEffect, useState } from "react";
import { getBalance } from "@/rpc/balance";
import { getTokenBalance } from "@/rpc/token";
import { ethers } from "ethers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const navigate = useNavigate();
  const { activeAddress, network, provider, networkId, tokens: contextTokens, history } = useWallet();
  const [ethBalance, setEthBalance] = useState<string>("0.00");
  const [tokenHoldings, setTokenHoldings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    if (!activeAddress || !provider) return;
    setIsLoading(true);
    try {
      const ethBal = await getBalance(activeAddress, provider);
      setEthBalance(ethBal.toFixed(4));

      // Fetch all tokens from context
      const balances = await Promise.all(
        contextTokens.map(async (t) => {
          try {
            const bal = await getTokenBalance(t.contract, activeAddress, provider);
            return {
              ...t,
              balance: ethers.formatUnits(bal, t.decimals)
            };
          } catch (e) {
            return { ...t, balance: "0.00" };
          }
        })
      );
      setTokenHoldings(balances);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
      toast.error("Failed to update balances");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeAddress, networkId, provider, contextTokens]);

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden animate-fade-in font-outfit max-w-7xl mx-auto w-full">
      {/* Header - Matches TokensPage Exactly */}
      <div className="flex items-center justify-between mb-8 shrink-0 ml-2">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg border border-primary/20 shadow-primary/5">
            <LayoutDashboard className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">Dashboard</h1>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">
              Network: {network.name}
            </p>
          </div>
        </div>
        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
            className="h-12 w-12 rounded-xl border border-white/5 hover:bg-white/10 transition-all text-muted-foreground hover:text-primary"
          >
            <RefreshCcw className={cn("w-5 h-5", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Main Content Grid - Expandable but scroll-locked */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-0">
        {/* Left Column: Balance + Tokens */}
        <div className="lg:col-span-2 flex flex-col space-y-6 min-h-0">
          {/* Balance Card - Fixed in middle column */}
          <div className="glass p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.5)] shrink-0">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] -mr-40 -mt-40 transition-all duration-700 group-hover:bg-primary/30 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-[60px] -ml-20 -mb-20" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
                  <Wallet className="w-4 h-4 text-primary opacity-90 shadow-primary" />
                </div>
                <p className="text-muted-foreground text-[9px] uppercase font-bold tracking-[0.2em]">Total Balance</p>
              </div>
              <h2 className="text-6xl font-black text-foreground tracking-tighter flex items-baseline gap-3">
                {ethBalance} <span className="text-primary/40 text-2xl font-bold">{network.currency}</span>
              </h2>
            </div>
          </div>

          {/* Token Holdings - SCROLLABLE */}
          <div className="flex-1 glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <h3 className="font-black text-xl flex items-center gap-3 tracking-tight">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Coins className="w-4 h-4 text-primary" />
                </div>
                Token Holdings
              </h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary font-bold hover:bg-primary/10 text-[9px] uppercase tracking-widest px-4 h-8"
                onClick={() => navigate("/tokens")}
              >
                Manage
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-4">
              {tokenHoldings.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 bg-white/5 rounded-3xl border border-dashed border-white/10 opacity-60">
                  <Coins className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
                  <p className="text-sm font-bold text-muted-foreground">No custom assets found.</p>
                  <Button variant="link" size="sm" className="mt-2 text-primary font-bold" onClick={() => navigate("/tokens")}>Import a token</Button>
                </div>
              ) : (
                tokenHoldings.map(token => (
                  <div key={token.contract} className="flex items-center justify-between p-5 rounded-3xl bg-white/5 hover:bg-white/10 transition-all border border-white/5 group/item">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center font-black text-primary border border-white/5 shadow-lg group-hover/item:scale-110 transition-transform">
                        {token.symbol[0]}
                      </div>
                      <div>
                        <p className="text-base font-black text-foreground">{token.name}</p>
                        <p className="text-[10px] font-mono text-muted-foreground uppercase font-bold tracking-widest">{token.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black font-mono text-foreground tracking-tighter">{parseFloat(token.balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                      <p className="text-[9px] font-bold text-muted-foreground tracking-widest uppercase opacity-40">Available</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity - SCROLLABLE */}
        <div className="lg:col-span-1 min-h-0 h-full">
          <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl h-full flex flex-col min-h-0">
            <h3 className="font-black text-xl mb-8 flex items-center gap-3 tracking-tight shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <RefreshCcw className="w-4 h-4 text-primary" />
              </div>
              Recent Activity
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin space-y-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-40 py-20">
                  <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                    <History className="w-8 h-8 text-muted-foreground opacity-20" />
                  </div>
                  <p className="text-sm font-black text-foreground tracking-tight">No Activity</p>
                  <p className="text-[10px] text-muted-foreground mt-2 px-6 font-bold uppercase tracking-widest leading-loose">Your transaction record is empty.</p>
                </div>
              ) : (
                history.map((tx) => (
                  <div key={tx.hash} className="group/tx p-4 rounded-3xl bg-white/5 border border-white/5 hover:bg-primary/5 hover:border-primary/20 transition-all cursor-pointer relative" onClick={() => window.open(`${network.explorer}/tx/${tx.hash}`, "_blank")}>
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 shadow-lg">
                          <ArrowUpRight className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-foreground">Sent {tx.asset}</p>
                          <p className="text-[10px] font-mono text-muted-foreground truncate opacity-60">To: {tx.recipient.slice(0, 10)}...</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-foreground">-{tx.amount}</p>
                        <p className="text-[9px] text-muted-foreground font-bold tracking-tighter uppercase">{new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    <ExternalLink className="absolute top-3 right-3 w-3 h-3 text-primary opacity-0 group-hover/tx:opacity-60 transition-opacity" />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
