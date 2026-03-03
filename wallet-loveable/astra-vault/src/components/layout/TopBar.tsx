import { Lock, ChevronDown, Globe, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/store/WalletContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TopBar() {
  const { network, activeAddress, setWalletState } = useWallet();

  const handleLock = () => {
    setWalletState({ mnemonic: null, accounts: [], activeAddress: null, privateKey: null });
  };

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-md flex items-center justify-end px-6 gap-3 shrink-0 relative z-40">
      {/* Network Display */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground/80">{network.name}</span>
      </div>

      {/* Account Display */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50 border border-border/50">
        <User className="w-3 h-3 text-muted-foreground" />
        <span className="text-[10px] font-mono font-bold text-muted-foreground">
          {activeAddress ? `${activeAddress.slice(0, 6)}...${activeAddress.slice(-4)}` : "No Account"}
        </span>
      </div>

      <div className="w-px h-6 bg-border mx-1" />

      {/* Lock */}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLock}
        className="text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all group rounded-xl"
      >
        <Lock className="w-4 h-4 group-hover:scale-110 transition-transform" />
      </Button>
    </header>
  );
}
