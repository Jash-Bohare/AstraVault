import { useState } from "react";
import { Eye, EyeOff, Copy, Check, Terminal, ShieldAlert, Cpu, Globe, Database, Fingerprint } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/store/WalletContext";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={handleCopy} className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-primary transition-all shrink-0">
      {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function DataRow({ label, value, mono = true, icon: Icon }: { label: string; value: string; mono?: boolean; icon?: any }) {
  return (
    <div className="group flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 hover:bg-primary/5 transition-all">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && <Icon className="w-4 h-4 text-primary/50 group-hover:text-primary transition-colors" />}
        <div className="min-w-0">
          <p className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">{label}</p>
          <p className={`text-sm truncate text-foreground/90 ${mono ? "font-mono" : "font-bold"}`}>{value}</p>
        </div>
      </div>
      <CopyButton text={value} />
    </div>
  );
}

export default function DeveloperPanel() {
  const { activeAddress, activePrivateKey, mnemonic, network, networkId } = useWallet();
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden animate-fade-in font-outfit max-w-7xl mx-auto w-full">
      {/* Header - Synchronized with global standard */}
      <div className="flex items-center justify-between mb-8 shrink-0 ml-2">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg border border-primary/20 shadow-primary/5">
            <Terminal className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">Developer Panel</h1>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">System State & Private Keys</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
        {/* Left Column: Identity Core */}
        <section className="glass p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col group/section h-full">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover/section:bg-primary/10 transition-all duration-1000" />

          <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4 relative z-10">
            <Fingerprint className="w-4 h-4 text-primary" />
            <h2 className="text-xs font-black text-foreground tracking-tight uppercase tracking-[0.15em]">Wallet Account</h2>
          </div>

          <div className="space-y-3 relative z-10 flex-1">
            <DataRow label="Address" value={activeAddress || "Uninitialized"} icon={Globe} />
            <DataRow label="Derivation Path" value="m/44'/60'/0'/0/x" icon={Cpu} />

            <div className="group flex items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-destructive/30 hover:bg-destructive/5 transition-all duration-500">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20 shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] uppercase font-black text-destructive tracking-[0.2em] mb-1">Private Key</p>
                  <p className="text-xs font-mono truncate text-foreground/90 font-bold tracking-tighter">
                    {showKey ? activePrivateKey : "••••••••••••••••••••••••••••••••••••••••"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all flex items-center justify-center"
                >
                  {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
                {showKey && activePrivateKey && <CopyButton text={activePrivateKey} />}
              </div>
            </div>
          </div>

          <div className="mt-5 p-4 rounded-xl bg-destructive/10 border border-destructive/20 relative z-10 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-destructive animate-pulse" />
              <p className="text-[9px] text-destructive font-black uppercase tracking-[0.2em]">Security Warning</p>
            </div>
            <p className="text-[9px] text-destructive/80 font-bold leading-relaxed uppercase tracking-wide opacity-80">
              Direct exposure of private keys risks total asset loss. Use only for local verification.
            </p>
          </div>
        </section>

        {/* Right Column: Network & State */}
        <div className="flex flex-col space-y-6">
          {/* Network Context */}
          <section className="glass p-6 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden group/network">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover/network:bg-primary/10 transition-all duration-700" />

            <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4 relative z-10">
              <Globe className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-black text-foreground tracking-tight uppercase tracking-[0.15em]">Network</h2>
            </div>
            <div className="grid grid-cols-1 gap-3 relative z-10">
              <DataRow label="Active Network" value={network.name} mono={false} icon={Globe} />
              <div className="grid grid-cols-2 gap-3">
                <DataRow label="Chain ID" value={network.chainId.toString()} icon={Cpu} />
                <DataRow label="Currency" value={network.currency} icon={Database} />
              </div>
            </div>
          </section>

          {/* State Dump */}
          <section className="glass p-6 rounded-[2.5rem] border border-white/5 shadow-2xl flex-1 flex flex-col relative overflow-hidden group/session">
            <div className="flex items-center gap-3 mb-5 border-b border-white/5 pb-4 relative z-10">
              <Database className="w-4 h-4 text-primary" />
              <h2 className="text-xs font-black text-foreground tracking-tight uppercase tracking-[0.15em]">Session Data</h2>
            </div>
            <div className="relative flex-1 min-h-0 z-10">
              <div className="absolute inset-0 rounded-xl bg-black/40 border border-white/5 p-4 overflow-hidden">
                <pre className="text-[10px] font-mono text-primary/70 h-full overflow-y-auto scrollbar-thin selection:bg-primary/20 leading-relaxed font-bold">
                  {JSON.stringify({
                    network: network.name,
                    chainId: network.chainId,
                    identity: activeAddress?.slice(0, 10) + "...",
                    session_active: !!activePrivateKey,
                    vault_initialized: !!mnemonic,
                    ts: new Date().toISOString(),
                    env: "production_stable"
                  }, null, 2)}
                </pre>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
