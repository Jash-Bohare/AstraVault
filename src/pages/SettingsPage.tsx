import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Globe, Shield, AlertTriangle, Key, Bell, Lock, Trash2, Smartphone, Settings2 } from "lucide-react";
import { useWallet } from "@/store/WalletContext";

export default function SettingsPage() {
  const { network } = useWallet();

  const handleReset = () => {
    if (confirm("Are you sure? This will delete all your wallet data from this browser!")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-hidden animate-fade-in font-outfit max-w-7xl mx-auto w-full">
      {/* Header - Synchronized with global standard */}
      <div className="flex items-center justify-between mb-8 shrink-0 ml-2">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-lg border border-primary/20 shadow-primary/5">
            <Settings2 className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tighter">Settings</h1>
            <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-60">Manage preferences and security</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">

        {/* Left Column: Network & Infrastructure */}
        <div className="flex flex-col space-y-6">
          <section className="glass p-6 rounded-[2rem] border border-white/5 shadow-2xl space-y-5 relative overflow-hidden group flex-1">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors duration-700" />

            <div className="flex items-center gap-3 relative z-10 border-b border-white/5 pb-4">
              <Globe className="w-4 h-4 text-primary opacity-80" />
              <h2 className="text-xs font-black text-foreground tracking-[0.15em] uppercase">Network</h2>
            </div>

            <div className="space-y-4 relative z-10">
              <div className="space-y-2">
                <Label className="text-[9px] uppercase font-black text-muted-foreground tracking-[0.2em] ml-1 opacity-60">Custom RPC URL</Label>
                <Input placeholder="https://mainnet.infura.io/v3/..." className="glass-input h-12 px-4 rounded-xl border-white/5 focus:border-primary/50 font-mono text-[10px] transition-all bg-white/5 shadow-inner" />
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group/switch hover:bg-white/10 transition-all">
                <div className="space-y-0.5">
                  <p className="text-sm font-black text-foreground">Active Discovery</p>
                  <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wide opacity-60">Auto-detect connected network</p>
                </div>
                <Switch className="data-[state=checked]:bg-primary scale-90" />
              </div>
            </div>
          </section>

          {/* Account Cleanup / Terminal Zone */}
          <section className="p-6 rounded-[2rem] border border-destructive/20 bg-destructive/5 shadow-2xl space-y-4 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-destructive/20 transition-colors duration-700" />

            <div className="flex items-center gap-3 relative z-10 border-b border-destructive/10 pb-4">
              <AlertTriangle className="w-4 h-4 text-destructive opacity-80" />
              <h2 className="text-xs font-black text-destructive tracking-[0.15em] uppercase">Danger Zone</h2>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              <div className="space-y-1">
                <p className="text-sm font-black text-foreground">Factory Reset</p>
                <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wide opacity-60 leading-relaxed">Deletes all wallet data, history, and assets from this browser. This cannot be undone.</p>
              </div>
              <Button variant="destructive" className="w-full h-11 font-black rounded-lg shadow-xl shadow-destructive/20 hover:scale-[1.02] transition-all uppercase text-[8px] tracking-[0.2em]" onClick={handleReset}>
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Reset Vault
              </Button>
            </div>
          </section>
        </div>

        {/* Right Column: Access & Security Protocol */}
        <div className="flex flex-col">
          <section className="glass p-6 rounded-[2rem] border border-white/5 shadow-2xl space-y-6 relative overflow-hidden flex-1 flex flex-col">
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <Shield className="w-4 h-4 text-primary opacity-80" />
              <h2 className="text-xs font-black text-foreground tracking-[0.15em] uppercase">Security</h2>
            </div>

            <div className="space-y-5 flex-1">
              <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-sm font-black text-foreground">Auto-Lock</p>
                    <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-wide opacity-60">Session locks after 15m of inactivity</p>
                  </div>
                </div>
                <Switch defaultChecked className="data-[state=checked]:bg-primary scale-90" />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex flex-col space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase font-black text-muted-foreground tracking-[0.2em] ml-1 opacity-60">Current Password</Label>
                    <Input type="password" placeholder="••••••••" className="glass-input h-11 px-4 rounded-xl border-white/5 focus:border-primary/50 bg-white/5 text-xs" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[9px] uppercase font-black text-muted-foreground tracking-[0.2em] ml-1 opacity-60">New Password</Label>
                    <Input type="password" placeholder="••••••••" className="glass-input h-11 px-4 rounded-xl border-white/5 focus:border-primary/50 bg-white/5 text-xs" />
                  </div>
                </div>
              </div>
            </div>

            <Button variant="secondary" className="w-full h-12 bg-white/10 hover:bg-white/20 font-black rounded-xl transition-all shadow-lg border border-white/5 uppercase text-[9px] tracking-widest mt-auto shadow-primary/5 transition-all hover:scale-[1.02] active:scale-[0.98]" onClick={() => toast.success("Password updated")}>
              Update Password
            </Button>
          </section>
        </div>

      </div>
    </div>
  );
}
