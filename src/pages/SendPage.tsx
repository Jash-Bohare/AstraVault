import { useState, useEffect } from "react";
import { Send, Loader2, Info, Coins, Wallet, CheckCircle2, AlertCircle, RefreshCcw, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWallet } from "@/store/WalletContext";
import { getNonce, getGasData, estimateGas, broadcastTx } from "@/rpc/transaction";
import { prepareTokenTransfer } from "@/rpc/token";
import { ethers } from "ethers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function SendPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeAddress, activePrivateKey, provider, network, tokens, addHistoryItem } = useWallet();

  const [assetId, setAssetId] = useState("eth");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);
  const [isEstimating, setIsEstimating] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [txData, setTxData] = useState<any>(null);
  const [confirmData, setConfirmData] = useState<any>(null);

  // Auto-select token if coming from TokensPage
  useEffect(() => {
    if (location.state?.token) {
      setAssetId(location.state.token.contract);
    }
  }, [location.state]);

  const selectedAsset = assetId === "eth"
    ? { name: network.name, symbol: network.currency, decimals: 18, contract: "Native" }
    : tokens.find(t => t.contract === assetId);

  const handleReview = async () => {
    if (!activeAddress || !activePrivateKey || !provider) return;
    if (!ethers.isAddress(recipient)) {
      toast.error("Invalid recipient address");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsEstimating(true);
    try {
      const signer = new ethers.Wallet(activePrivateKey, provider);
      const nonce = await getNonce(activeAddress, provider);
      const { maxFeePerGas, maxPriorityFeePerGas, gasPrice } = await getGasData(provider);

      let tx: any = {
        from: activeAddress,
        nonce,
        chainId: network.chainId,
      };

      if (maxFeePerGas) {
        tx.maxFeePerGas = maxFeePerGas;
        tx.maxPriorityFeePerGas = maxPriorityFeePerGas;
        tx.type = 2; // EIP-1559
      } else {
        tx.gasPrice = gasPrice || 0n;
      }

      if (assetId === "eth") {
        tx.to = recipient;
        tx.value = ethers.parseEther(amount);
      } else if (selectedAsset) {
        const tokenTx = await prepareTokenTransfer(
          selectedAsset.contract,
          recipient,
          amount,
          selectedAsset.decimals,
          signer
        );
        tx.to = tokenTx.to;
        tx.data = tokenTx.data;
      }

      // Estimate gas
      let gasLimit;
      try {
        gasLimit = await estimateGas(tx, provider);
      } catch (e) {
        console.warn("Gas estimation failed, using fallback", e);
        gasLimit = 100000n;
      }
      tx.gasLimit = gasLimit;

      const effectiveGasPrice = maxFeePerGas || gasPrice || 0n;
      const networkFee = ethers.formatEther(gasLimit * effectiveGasPrice);
      const totalCost = assetId === "eth"
        ? (parseFloat(amount) + parseFloat(networkFee)).toFixed(8)
        : networkFee;

      setTxData(tx);
      setConfirmData({
        from: activeAddress,
        to: recipient,
        amount: `${amount} ${selectedAsset?.symbol}`,
        gas: `${parseFloat(networkFee).toFixed(12).replace(/\.?0+$/, '')} ${network.currency}`, // Use high precision
        total: assetId === "eth"
          ? `${totalCost} ${network.currency}`
          : `${amount} ${selectedAsset?.symbol} + ${parseFloat(networkFee).toFixed(12).replace(/\.?0+$/, '')} ${network.currency}`,
      });
      setShowConfirm(true);
    } catch (err: any) {
      console.error(err);
      toast.error(`Review failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsEstimating(false);
    }
  };

  const handleSend = async () => {
    if (!activePrivateKey || !txData || !provider) return;
    setLoading(true);
    try {
      const resp = await broadcastTx(activePrivateKey, txData, provider);

      addHistoryItem({
        hash: resp.hash,
        type: "send",
        asset: selectedAsset?.symbol || "Unknown",
        amount,
        recipient,
        timestamp: Date.now(),
        status: "confirmed"
      });

      toast.success("Transaction broadcasted successfully!");
      navigate("/");
    } catch (err: any) {
      console.error(err);
      toast.error(`Broadcast failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden animate-fade-in font-outfit max-w-7xl mx-auto w-full">
      {/* Header - Synchronized Standard */}
      <div className="flex items-center justify-between mb-8 shrink-0 ml-2">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg border border-primary/20 shadow-primary/5">
            <Send className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">Send Assets</h1>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">
              Transfer funds on {network.name}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">

        {/* Left Pillar: Transaction Parameters */}
        <section className="glass p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col group/params h-full">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover/params:bg-primary/10 transition-all duration-1000" />

          <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4 relative z-10">
            <RefreshCcw className="w-4 h-4 text-primary opacity-80" />
            <h2 className="text-xs font-black text-foreground tracking-tight uppercase tracking-[0.15em]">Parameters Hub</h2>
          </div>

          <div className="space-y-5 relative z-10 flex-1 flex flex-col">
            <div className="space-y-5 flex-1">
              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 opacity-60">Asset Selection</Label>
                <Select value={assetId} onValueChange={(v) => { setAssetId(v); setShowConfirm(false); }}>
                  <SelectTrigger className="glass-input h-12 rounded-xl border-white/5 hover:border-white/10 transition-all font-black text-sm px-4 shadow-inner bg-white/5">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent className="glass border-white/10 p-2 rounded-xl shadow-2xl backdrop-blur-2xl">
                    <SelectItem value="eth" className="rounded-lg focus:bg-primary/20 focus:text-white cursor-pointer h-10 mb-1 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center border border-white/10 shadow-lg">
                          <Wallet className="w-3 h-3 text-primary" />
                        </div>
                        <span className="text-sm tracking-tighter font-medium">{network.name}</span>
                      </div>
                    </SelectItem>
                    {tokens.map((t) => (
                      <SelectItem key={t.contract} value={t.contract} className="rounded-lg focus:bg-primary/20 focus:text-white cursor-pointer h-10 mb-1 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center border border-white/10 shadow-lg">
                            <Coins className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm tracking-tighter font-medium">{t.symbol}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 opacity-60">Recipient Identity</Label>
                <Input
                  placeholder="0x..."
                  className="glass-input h-12 px-4 rounded-xl border-white/5 focus:border-primary/50 font-mono text-xs transition-all bg-white/5 shadow-inner"
                  value={recipient}
                  onChange={(e) => { setRecipient(e.target.value.trim()); setShowConfirm(false); }}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 opacity-60">Amount</Label>
                <div className="relative group">
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="glass-input h-12 px-4 rounded-xl border-white/5 focus:border-primary/50 font-black text-lg transition-all bg-white/5 text-center shadow-inner tracking-tighter pr-16"
                    value={amount}
                    onChange={(e) => { setAmount(e.target.value); setShowConfirm(false); }}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md border border-primary/20 uppercase tracking-widest">
                      {selectedAsset?.symbol}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full h-12 rounded-xl glow-amber font-black text-[9px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/5 mt-auto"
              onClick={handleReview}
              disabled={isEstimating || !recipient || !amount}
            >
              {isEstimating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span className="flex items-center gap-3">
                  Estimate Parameters
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </div>
        </section>

        {/* Right Pillar: Transmission Portal */}
        <section className="glass p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col group/confirm h-full">
          <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4 relative z-10">
            <ShieldCheck className="w-4 h-4 text-primary opacity-80" />
            <h2 className="text-xs font-black text-foreground tracking-tight uppercase tracking-[0.15em]">Confirmation</h2>
          </div>

          {!showConfirm ? (
            <div className="flex-1 flex flex-col items-center justify-center space-y-4 animate-in fade-in zoom-in-95 duration-700 relative z-10">
              <div className="w-20 h-20 rounded-[2rem] bg-white/5 border border-white/5 flex items-center justify-center relative overflow-hidden shadow-inner">
                <div className="absolute inset-0 bg-primary/10 opacity-30" />
                <Send className="w-8 h-8 text-primary shadow-2xl shadow-primary/50" />
              </div>
              <div className="text-center">
                <p className="text-[10px] font-black tracking-widest uppercase text-muted-foreground opacity-60">Ready to Send</p>
                <p className="text-[8px] font-bold text-muted-foreground/40 mt-1 uppercase">Enter details to continue</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col space-y-5 animate-in slide-in-from-right duration-500 fade-in relative z-10">
              <div className="space-y-4 flex-1">
                <div className="space-y-2">
                  <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 opacity-60">Broadcast Recipient</Label>
                  <div className="h-12 flex items-center px-4 rounded-xl bg-black/20 border border-white/5">
                    <p className="font-mono text-[11px] text-foreground truncate w-full">
                      {confirmData.to}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 opacity-60">Network Fee</Label>
                    <div className="h-12 flex items-center justify-center px-4 rounded-xl bg-black/20 border border-white/5">
                      <p className="text-sm font-black text-primary tracking-tighter tabular-nums truncate">{confirmData.gas}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 opacity-60">Total Cost</Label>
                    <div className="h-12 flex items-center justify-center px-4 rounded-xl bg-black/20 border border-white/5">
                      <p className="text-sm font-black text-foreground tracking-tighter tabular-nums truncate">{confirmData.total}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-4 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0 border border-primary/20 shadow-lg">
                    <Info className="w-5 h-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[8px] uppercase font-black text-primary tracking-[0.2em] mb-0.5">Security Check</p>
                    <p className="text-[9px] text-muted-foreground leading-snug font-bold uppercase tracking-wide">
                      Transaction ready. Please verify all details before sending.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-auto">
                <Button
                  className="w-full h-12 rounded-xl glow-amber-strong font-black text-[9px] uppercase tracking-widest group relative overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/20"
                  onClick={handleSend}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-3">
                      Broadcast Transaction
                      <CheckCircle2 className="w-4 h-4" />
                    </span>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 h-10 transition-colors"
                  onClick={() => setShowConfirm(false)}
                >
                  Abort Transmission
                </Button>
              </div>
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
