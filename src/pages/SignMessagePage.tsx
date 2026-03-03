import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Copy, Check, PenTool, Loader2, ShieldCheck, UserCheck, AlertCircle, XCircle, ArrowRightCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { useWallet } from "@/store/WalletContext";
import { signPersonalMessage, verifyPersonalMessage } from "@/core/wallet";

export default function SignMessagePage() {
  const { activePrivateKey, activeAddress } = useWallet();

  // Signing States
  const [message, setMessage] = useState("");
  const [signature, setSignature] = useState("");
  const [copied, setCopied] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // Verification States
  const [vMessage, setVMessage] = useState("");
  const [vSignature, setVSignature] = useState("");
  const [recoveredAddress, setRecoveredAddress] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSign = async () => {
    if (!activePrivateKey) {
      toast.error("No wallet active");
      return;
    }
    setIsSigning(true);
    try {
      const sig = await signPersonalMessage(activePrivateKey, message.trim());
      setSignature(sig);
      toast.success("Message signed successfully");
    } catch (err: any) {
      console.error(err);
      toast.error("Signing failed");
    } finally {
      setIsSigning(false);
    }
  };

  const handleVerify = () => {
    const trimmedMsg = vMessage.trim();
    const trimmedSig = vSignature.trim();

    if (!trimmedMsg || !trimmedSig) {
      toast.error("Please provide both message and signature");
      return;
    }

    setIsVerifying(true);
    setVerificationStatus("idle");
    setRecoveredAddress("");

    try {
      // Small timeout to show loading state for better UX
      setTimeout(() => {
        try {
          const address = verifyPersonalMessage(trimmedMsg, trimmedSig);
          setRecoveredAddress(address);
          setVerificationStatus("success");
          toast.success("Signature verified");
        } catch (err: any) {
          console.error(err);
          setVerificationStatus("error");
          toast.error("Verification failed");
        } finally {
          setIsVerifying(false);
        }
      }, 400);
    } catch (err) {
      setIsVerifying(false);
      setVerificationStatus("error");
    }
  };

  const autofillVerified = () => {
    if (!signature) {
      toast.error("Sign a message first to auto-fill");
      return;
    }
    setVMessage(message);
    setVSignature(signature);
    setVerificationStatus("idle");
    setRecoveredAddress("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(signature);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMatched = recoveredAddress?.toLowerCase() === activeAddress?.toLowerCase();

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden animate-fade-in font-outfit max-w-7xl mx-auto w-full">
      {/* Header - Synchronized with global standard */}
      <div className="flex items-center justify-between mb-8 shrink-0 ml-2">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg border border-primary/20 shadow-primary/5">
            <PenTool className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">Sign Message</h1>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Sign and verify data</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">

        {/* Left Column: Sign Message */}
        <section className="glass p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col group/sign">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover/sign:bg-primary/10 transition-all duration-1000" />

          <div className="flex items-center justify-between mb-5 border-b border-white/5 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <PenTool className="w-4 h-4 text-primary opacity-80" />
              <h2 className="text-xs font-black text-foreground tracking-tight uppercase tracking-[0.15em]">Sign Message</h2>
            </div>
            {signature && (
              <button
                onClick={autofillVerified}
                className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-primary hover:text-primary/70 transition-colors"
                title="Verify this signature immediately"
              >
                Fast Verify <ArrowRightCircle className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="space-y-5 relative z-10 flex-1 flex flex-col">
            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 opacity-60">Message Content</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter message to sign..."
                className="glass-input p-4 rounded-xl border-white/5 focus:border-primary/50 font-mono text-xs transition-all bg-white/5 shadow-inner resize-none flex-1 leading-relaxed"
              />
            </div>

            <Button
              onClick={handleSign}
              disabled={!message || isSigning}
              className="w-full h-12 rounded-xl glow-cyan-strong font-black text-[9px] uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/10"
            >
              {isSigning ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Message"}
            </Button>

            {signature && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-primary">Signature Proof</Label>
                </div>
                <div className="glass bg-white/5 rounded-xl p-4 relative group/sig border border-white/5 shadow-inner overflow-hidden min-h-[80px]">
                  <p className="text-[10px] font-mono text-primary/70 break-all pr-10 leading-relaxed">{signature}</p>
                  <button
                    onClick={handleCopy}
                    className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all hover:scale-110 border border-white/5"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Verify Signature */}
        <section className="glass p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col group/verify">
          <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4 relative z-10">
            <ShieldCheck className="w-4 h-4 text-primary opacity-80" />
            <h2 className="text-xs font-black text-foreground tracking-tight uppercase tracking-[0.15em]">Verify Message</h2>
          </div>

          <div className="space-y-5 relative z-10 flex-1 flex flex-col">
            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <div className="space-y-2 flex-1 flex flex-col">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 opacity-60">Message</Label>
                <Textarea
                  value={vMessage}
                  onChange={(e) => {
                    setVMessage(e.target.value);
                    if (verificationStatus !== "idle") setVerificationStatus("idle");
                  }}
                  placeholder="Paste original message here..."
                  className="glass-input p-4 rounded-xl border-white/5 focus:border-primary/50 font-mono text-xs transition-all bg-white/5 shadow-inner resize-none flex-1 leading-relaxed"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 opacity-60">Signature Hash</Label>
                <Input
                  value={vSignature}
                  onChange={(e) => {
                    setVSignature(e.target.value);
                    if (verificationStatus !== "idle") setVerificationStatus("idle");
                  }}
                  placeholder="0x..."
                  className="glass-input h-12 px-4 rounded-xl border-white/5 focus:border-primary/50 font-mono text-xs transition-all bg-white/5 shadow-inner"
                />
              </div>
            </div>

            <Button
              onClick={handleVerify}
              disabled={!vMessage || !vSignature || isVerifying}
              variant="secondary"
              className={cn(
                "w-full h-12 bg-white/10 hover:bg-white/20 font-black rounded-xl transition-all shadow-lg border border-white/5 uppercase text-[9px] tracking-widest mt-auto",
                verificationStatus === "success" && "border-primary/30 bg-primary/5"
              )}
            >
              {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : "Verify Signature"}
            </Button>

            <div className="h-[76px] relative">
              {verificationStatus === "success" && recoveredAddress && (
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md transition-all",
                    isMatched ? "bg-primary/10 border-primary/20" : "bg-amber-500/10 border-amber-500/20"
                  )}>
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center border shrink-0",
                      isMatched ? "bg-primary/20 border-primary/30" : "bg-amber-500/20 border-amber-500/30"
                    )}>
                      {isMatched ? <UserCheck className="w-5 h-5 text-primary" /> : <AlertCircle className="w-5 h-5 text-amber-500" />}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn("text-[8px] uppercase font-black tracking-[0.2em] mb-0.5", isMatched ? "text-primary" : "text-amber-500")}>
                          {isMatched ? "Signature Matches" : "Signature Verified"}
                        </p>
                      </div>
                      <p className="text-[10px] font-mono font-bold text-foreground/90 truncate">{recoveredAddress}</p>
                    </div>
                  </div>
                </div>
              )}

              {verificationStatus === "error" && (
                <div className="space-y-3 animate-in shake duration-500">
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center border border-destructive/30 shrink-0">
                      <XCircle className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-[8px] uppercase font-black text-destructive tracking-[0.2em] mb-0.5">Verification Failed</p>
                      <p className="text-[10px] font-bold text-destructive/80 leading-tight">Signature mismatch or invalid data detected.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
