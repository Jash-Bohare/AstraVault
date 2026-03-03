import { LayoutDashboard, Send, Coins, PenTool, Terminal, Settings, Shield, Plus, LogOut, Check, Globe } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useWallet } from "@/store/WalletContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NETWORKS } from "@/config/networks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Send", url: "/send", icon: Send },
  { title: "Tokens", url: "/tokens", icon: Coins },
  { title: "Sign Message", url: "/sign", icon: PenTool },
  { title: "Developer Panel", url: "/developer", icon: Terminal },
  { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  const location = useLocation();
  const {
    activeAddress,
    accounts,
    networkId,
    setNetworkId,
    addAccount,
    switchAccount,
    setWalletState
  } = useWallet();

  const handleLogout = () => {
    setWalletState({ mnemonic: null, accounts: [], activeAddress: null, privateKey: null });
  };

  return (
    <aside className="w-72 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0 overflow-hidden">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <Shield className="w-6 h-6 text-primary mr-3" />
        <span className="text-lg font-bold text-foreground tracking-tight">AstraVault</span>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* Network Selector */}
        <div className="px-4 py-4 border-b border-sidebar-border bg-sidebar-accent/30">
          <label className="text-[10px] uppercase font-bold text-muted-foreground mb-2 block px-1 flex items-center gap-1">
            <Globe className="w-3 h-3" /> Network
          </label>
          <Select value={networkId} onValueChange={setNetworkId}>
            <SelectTrigger className="w-full bg-background border-border/50 h-9 text-xs">
              <SelectValue placeholder="Select Network" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {Object.values(NETWORKS).map((net) => (
                <SelectItem key={net.id} value={net.id} className="text-xs">
                  {net.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Nav Section */}
        <ScrollArea className="flex-1">
          <div className="py-4 px-3 space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground px-3 mb-2">Menu</p>
            {navItems.map((item) => {
              const isActive = item.url === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(item.url);
              return (
                <NavLink
                  key={item.url}
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary shadow-sm"
                      : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive && "text-primary")} />
                  <span>{item.title}</span>
                </NavLink>
              );
            })}

            <div className="mt-8 pt-4 border-t border-sidebar-border">
              <div className="flex items-center justify-between px-3 mb-2">
                <p className="text-[10px] uppercase font-bold text-muted-foreground">Accounts</p>
                <Button variant="ghost" size="icon" className="h-4 w-4" onClick={addAccount}>
                  <Plus className="w-3 h-3" />
                </Button>
              </div>

              <div className="space-y-1">
                {accounts.map((acc, i) => (
                  <button
                    key={acc.address}
                    onClick={() => switchAccount(acc.address)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all",
                      activeAddress === acc.address
                        ? "bg-accent/50 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px]">
                        {i + 1}
                      </div>
                      <span className="truncate">{acc.address.slice(0, 6)}...{acc.address.slice(-4)}</span>
                    </div>
                    {activeAddress === acc.address && <Check className="w-3 h-3 text-primary" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Footer */}
      {/* Footer Removed */}
    </aside>
  );
}

