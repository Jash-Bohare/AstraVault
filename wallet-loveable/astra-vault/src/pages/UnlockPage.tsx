import { useState } from "react";
import { Shield, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWallet } from "../store/WalletContext";
import { decryptPrivateKey } from "../utils/crypto";
import { derivePrivateKey } from "../core/wallet";
import { toast } from "sonner";

export default function UnlockPage() {
  const [password, setPassword] = useState("");
  const { setWalletState } = useWallet();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedStr = localStorage.getItem("wallet");
    if (!storedStr) return;

    try {
      const data = JSON.parse(storedStr);
      const mnemonic = await decryptPrivateKey(data, password);

      // Restore accounts
      const accs = data.accounts || [];
      const storedAddr = localStorage.getItem("activeAddress");
      const activeAccount = accs.find((a: any) => a.address === storedAddr) || accs[0];

      // Derive active PK
      const pk = await derivePrivateKey(mnemonic, activeAccount.index);

      setWalletState({
        mnemonic,
        accounts: accs,
        activeAddress: activeAccount.address,
        privateKey: pk
      });

      // Enforce Dashboard landing without destructive reload
      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (err) {
      console.error(err);
      toast.error("Invalid password - decryption failed");
    }
  };

  return (
    <div className="h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden font-outfit">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.05] pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(186 100% 50%) 0%, transparent 70%)' }}
      />

      <div className="w-full max-w-sm z-10">
        <form onSubmit={handleSubmit} className="glass border border-white/5 rounded-[2.5rem] p-10 space-y-8 animate-fade-in shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />

          <div className="flex flex-col items-center text-center relative z-10">
            <div className="w-20 h-20 rounded-[2rem] bg-primary/10 flex items-center justify-center mb-6 shadow-lg border border-primary/20 shadow-primary/5">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl font-black text-foreground tracking-tighter mb-2">Astra Vault</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Welcome Back</p>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="space-y-2">
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] ml-1 opacity-60">Unlock Wallet</p>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="glass-input h-14 px-6 rounded-2xl border-white/5 focus:border-primary/50 bg-white/5 text-center text-lg font-black tracking-tighter transition-all shadow-inner"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              disabled={password.length === 0}
              className="w-full h-14 glow-cyan-strong font-black text-[9px] uppercase tracking-widest gap-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Authorize Protocol Access
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

