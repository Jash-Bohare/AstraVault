import { Plus, Send, RefreshCcw, Coins, Trash2, Search, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useWallet } from "@/store/WalletContext";
import { useState, useEffect } from "react";
import { getTokenBalance, getTokenMetadata } from "@/rpc/token";
import { ethers } from "ethers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function CopyButton({ text, className = "" }: { text: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className={cn("p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-all shrink-0", className)}>
      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

export default function TokensPage() {
  const navigate = useNavigate();
  const { activeAddress, provider, network, tokens: contextTokens, addToken, removeToken } = useWallet();
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Add Token Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [tempToken, setTempToken] = useState<any>(null);

  const fetchTokenBalances = async () => {
    if (!activeAddress || !provider) return;
    setIsLoading(true);
    try {
      const balances: Record<string, string> = {};
      await Promise.all(
        contextTokens.map(async (t) => {
          try {
            const bal = await getTokenBalance(t.contract, activeAddress, provider);
            balances[t.contract] = ethers.formatUnits(bal, t.decimals);
          } catch (e) {
            balances[t.contract] = "0.00";
          }
        })
      );
      setTokenBalances(balances);
    } catch (err) {
      console.error("Token fetch failed:", err);
      toast.error("Failed to fetch token balances");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchToken = async () => {
    if (!ethers.isAddress(addressInput)) {
      toast.error("Invalid Ethereum address");
      return;
    }
    setIsSearching(true);
    setTempToken(null);
    try {
      const meta = await getTokenMetadata(addressInput, provider);
      setTempToken({
        ...meta,
        contract: addressInput,
        isCustom: true, // Mark as custom token
      });
    } catch (err) {
      toast.error("Could not find token at this address");
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddToken = () => {
    if (tempToken) {
      // Check for duplicates
      if (contextTokens.some(t => t.contract.toLowerCase() === tempToken.contract.toLowerCase())) {
        toast.error("Token already added");
        return;
      }
      addToken(tempToken);
      setIsModalOpen(false);
      setAddressInput("");
      setTempToken(null);
      toast.success(`${tempToken.symbol} added successfully`);
    }
  };

  useEffect(() => {
    fetchTokenBalances();
  }, [activeAddress, provider, network, contextTokens]);

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden animate-fade-in font-outfit max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8 shrink-0 ml-2">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg border border-primary/20 shadow-primary/5">
            <Coins className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">Tokens</h1>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Manage your assets</p>
          </div>
        </div>

        <div className="flex gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={fetchTokenBalances}
            disabled={isLoading}
            className="h-12 w-12 rounded-xl border border-white/5 hover:bg-white/10 transition-all text-muted-foreground hover:text-primary"
          >
            <RefreshCcw className={cn("w-5 h-5", isLoading && "animate-spin")} />
          </Button>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="glow-amber-strong h-12 px-6 rounded-xl font-black text-[9px] uppercase tracking-widest gap-2 shadow-xl shadow-primary/10 hover:scale-105 active:scale-95 transition-all">
                <Plus className="w-4 h-4" />
                Import Token
              </Button>
            </DialogTrigger>
            <DialogContent className="glass shadow-2xl border-white/10 max-w-sm rounded-[2.5rem] p-8 border border-white/5">
              <DialogHeader className="mb-6 font-outfit">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <DialogTitle className="text-2xl font-black text-foreground tracking-tighter">Import Token</DialogTitle>
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Add custom contract address</p>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="address" className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 opacity-60">Contract Address</Label>
                  <div className="flex gap-3">
                    <Input
                      id="address"
                      placeholder="0x..."
                      className="font-mono text-xs glass border-white/5 rounded-xl h-12 px-4 bg-white/5 shadow-inner flex-1"
                      value={addressInput}
                      onChange={(e) => setAddressInput(e.target.value)}
                    />
                    <Button size="icon" variant="ghost" onClick={handleSearchToken} disabled={isSearching} className="h-12 w-12 rounded-xl border border-white/5 hover:bg-white/10 transition-all">
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <Search className="w-4 h-4 text-primary" />}
                    </Button>
                  </div>
                </div>

                {tempToken && (
                  <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 animate-fade-in shadow-inner">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-black text-foreground">{tempToken.name}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">{tempToken.symbol} • {tempToken.decimals} Decimals</p>
                      </div>
                      <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-black text-primary border border-white/10 shadow-lg">
                        {tempToken.symbol[0]}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)} className="glass border-white/5 rounded-xl">Cancel</Button>
                <Button onClick={handleAddToken} disabled={!tempToken} className="glow-amber-strong font-bold rounded-xl px-6">Import</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex-1 min-h-0 glass rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group mb-4 transition-all duration-700">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/10 transition-colors duration-1000" />

        <div className="h-full flex flex-col relative z-10 font-outfit">
          <div className="grid grid-cols-4 px-10 py-6 border-b border-white/5 bg-white/5 shrink-0">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60 pl-20">Wallet Detail</span>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60 text-center">Network Symbol</span>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60 text-center">Valuation</span>
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-60 text-right pr-6">Actions</span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin hover:scrollbar-thumb-primary/20 scrollbar-thumb-transparent transition-colors">
            {contextTokens.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center opacity-30 p-10 grayscale">
                <Coins className="w-20 h-20 mb-6 text-muted-foreground/50 animate-pulse" />
                <p className="text-sm font-black uppercase tracking-[0.2em]">No Assets Registered</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {contextTokens.map((token) => (
                  <div key={token.contract} className="grid grid-cols-4 items-center px-10 py-5 hover:bg-white/[0.03] transition-all group/row">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg group-hover/row:scale-110 transition-transform">
                        <span className="text-sm font-black text-primary uppercase">{token.symbol[0]}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-black text-base text-foreground tracking-tight leading-tight mb-0.5 truncate">{token.name}</p>
                        <p className="text-[9px] text-muted-foreground font-mono truncate max-w-[140px] opacity-60 font-bold">{token.contract}</p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-inner">
                        {token.symbol}
                      </span>
                    </div>
                    <div className="flex flex-col items-center">
                      <p className="font-black text-lg text-foreground tracking-tighter tabular-nums leading-tight">
                        {parseFloat(tokenBalances[token.contract] || "0").toFixed(4)}
                      </p>
                      <p className="text-[9px] text-primary font-black uppercase tracking-widest opacity-80">Confirmed Balance</p>
                    </div>
                    <div className="flex justify-end gap-2 pr-4">
                      <CopyButton text={token.contract} className="h-10 w-10 bg-white/5" />
                      {token.isCustom && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            removeToken(token.contract);
                            toast.success(`${token.symbol} removed`);
                          }}
                          className="h-10 w-10 text-destructive/60 hover:bg-destructive/10 hover:text-destructive transition-all rounded-lg border border-transparent hover:border-destructive/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
